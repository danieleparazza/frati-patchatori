// Daily push notifications for the almanac, plus the one dynamic API call a static site can't answer.
// - GET /api/v1/<lang>/today?tz=Europe/Rome: today's day file (api/v1/<lang>/days/<mmdd>.json) for that timezone.
// - POST /subscribe {subscription, lang, tz} stores a browser push subscription; POST /unsubscribe {endpoint}.
// - Every hour (cron), subscribers for whom it is 8:00 get a push with no payload: the site's service worker
//   then fetches the day's saint itself (push/<lang>/<mmdd>.json) and shows the notification. Without a payload
//   nothing needs encrypting, only the VAPID signature (RFC 8292).
// Subscriptions live in KV as key metadata (one list call per run, no reads); dead ones (404/410) are deleted.
// Free plan: ~24 KV lists a day, one write per new subscriber, pushes split into batches (see BATCH).

const HOUR = 8;

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const text = (s) => new TextEncoder().encode(s);

async function keyFor(endpoint) {
  return b64url(await crypto.subtle.digest('SHA-256', text(endpoint)));
}

function cors(env, req) {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = env.ALLOWED_ORIGINS.split(',');
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

/** VAPID JWT (ES256) for the push service's origin. */
const vapidCache = new Map();

async function vapidHeader(env, endpoint) {
  const aud = new URL(endpoint).origin;
  const hit = vapidCache.get(aud);
  if (hit && hit.until > Date.now()) return hit.value;
  const value = await signVapid(env, aud);
  vapidCache.set(aud, { value, until: Date.now() + 6 * 3600 * 1000 });
  return value;
}

async function signVapid(env, aud) {
  const key = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVATE_JWK), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const header = b64url(text(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64url(text(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, text(`${header}.${claims}`));
  return `vapid t=${header}.${claims}.${b64url(sig)}, k=${env.VAPID_PUBLIC}`;
}

async function send(env, endpoint) {
  return fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: await vapidHeader(env, endpoint), TTL: String(6 * 3600), Urgency: 'normal', 'Content-Length': '0' },
  });
}

function localHour(tz, now) {
  try {
    return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: tz }).format(now));
  } catch {
    return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Rome' }).format(now));
  }
}

// The free plan allows 50 outgoing requests per invocation: the hourly run only lists who is due and hands
// them to /batch in groups of 40, each a separate invocation (one request each from the cron run).
const BATCH = 40;

/** Sends the push to a group of subscriptions; deletes the ones the push service says are gone. */
async function sendBatch(env, items) {
  let sent = 0;
  let removed = 0;
  for (const { name, endpoint } of items) {
    const res = await send(env, endpoint);
    if (res.status === 404 || res.status === 410) {
      await env.SUBS.delete(name);
      removed++;
    } else if (res.ok) sent++;
  }
  return { sent, removed };
}

async function run(env) {
  const now = new Date();
  const due = [];
  let cursor;
  do {
    const page = await env.SUBS.list({ cursor });
    for (const { name, metadata } of page.keys) if (metadata?.endpoint && localHour(metadata.tz, now) === HOUR) due.push({ name, endpoint: metadata.endpoint });
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  const groups = [];
  for (let i = 0; i < due.length; i += BATCH) groups.push(due.slice(i, i + BATCH));
  if (groups.length === 1) return sendBatch(env, groups[0]);
  await Promise.all(
    groups.map((items) =>
      env.SELF.fetch('https://frati-push/batch', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Batch-Key': env.BATCH_KEY }, body: JSON.stringify(items) }),
    ),
  );
  return { due: due.length, batches: groups.length };
}

/** Public API: today's day file in the caller's timezone (default Europe/Rome), open to any origin. */
async function today(env, url) {
  const lang = url.pathname.split('/')[3];
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' };
  if (lang !== 'it' && lang !== 'en') return new Response(JSON.stringify({ error: 'lang must be it or en' }), { status: 400, headers });
  let mmdd;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { month: '2-digit', day: '2-digit', timeZone: url.searchParams.get('tz') || 'Europe/Rome' }).formatToParts(new Date());
    mmdd = `${parts.find((p) => p.type === 'month').value}-${parts.find((p) => p.type === 'day').value}`;
  } catch {
    return new Response(JSON.stringify({ error: 'unknown timezone' }), { status: 400, headers });
  }
  const res = await fetch(`${env.SITE}/api/v1/${lang}/days/${mmdd}.json`, { cf: { cacheTtl: 3600 } });
  return new Response(res.body, { status: res.status, headers });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'GET' && /^\/api\/v1\/[a-z]+\/today\/?$/.test(url.pathname)) return today(env, url);
    const headers = cors(env, req);
    if (req.method === 'OPTIONS') return new Response(null, { headers });
    if (req.method !== 'POST') return new Response('Lunario dei Frati Patchatori · push', { headers });
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response('bad json', { status: 400, headers });
    }
    if (url.pathname === '/subscribe') {
      const endpoint = body?.subscription?.endpoint;
      if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || endpoint.length > 600) return new Response('bad subscription', { status: 400, headers });
      const lang = body.lang === 'en' ? 'en' : 'it';
      const tz = typeof body.tz === 'string' && body.tz.length < 64 ? body.tz : 'Europe/Rome';
      await env.SUBS.put(await keyFor(endpoint), '', { metadata: { endpoint, lang, tz } });
      return new Response('ok', { headers });
    }
    if (url.pathname === '/batch') {
      if (!env.BATCH_KEY || req.headers.get('X-Batch-Key') !== env.BATCH_KEY || !Array.isArray(body)) return new Response('forbidden', { status: 403 });
      return new Response(JSON.stringify(await sendBatch(env, body.slice(0, BATCH))));
    }
    if (url.pathname === '/unsubscribe') {
      if (typeof body?.endpoint === 'string') await env.SUBS.delete(await keyFor(body.endpoint));
      return new Response('ok', { headers });
    }
    if (url.pathname === '/test') {
      // Sends one push right away to the given subscription, if it is registered: "send a test" on the site.
      if (typeof body?.endpoint !== 'string' || !(await env.SUBS.getWithMetadata(await keyFor(body.endpoint))).metadata) return new Response('unknown', { status: 404, headers });
      const res = await send(env, body.endpoint);
      return new Response(String(res.status), { status: res.ok ? 200 : 502, headers });
    }
    return new Response('not found', { status: 404, headers });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env).then((r) => console.log(JSON.stringify(r))));
  },
};
