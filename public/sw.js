// Service worker: makes the almanac installable and readable offline.
// - Pages: network first, falling back to the last copy (so new saints and fixes show up when online).
// - /_astro files have content hashes in their names: cache first, they never change.
// - Fonts, icons, images keep their names when they change: served from cache and refreshed in the background.
// - The next seven days in both languages are cached on install and topped up once a day while the app is used,
//   so it always works offline for about a week ahead.
// The browser checks this file for changes on every visit; a new version installs and takes over at once.
const CACHE = 'frati-v4';
// Reader settings (push language), kept across cache versions.
const SETTINGS = 'frati-settings';

function upcomingDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.now() + i * 86400000);
    days.push(String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  }
  return days;
}

function cacheUpcoming() {
  const pages = ['/it/', '/en/', ...upcomingDays(7).flatMap((d) => [`/it/${d}/`, `/en/${d}/`])];
  return caches.open(CACHE).then((cache) => Promise.allSettled(pages.map((p) => cache.add(p))));
}

/** Tops up the week ahead at most once a day (the date of the last top-up is kept in SETTINGS). */
async function refreshUpcoming() {
  const today = new Date().toDateString();
  const settings = await caches.open(SETTINGS);
  const last = await settings.match('/__sw/upcoming');
  if (last && (await last.text()) === today) return;
  await settings.put('/__sw/upcoming', new Response(today));
  await cacheUpcoming();
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheUpcoming().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== SETTINGS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const offline = () =>
  new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Offline</title>' +
      '<body style="font-family:Georgia,serif;background:#f6efe0;color:#2b1d14;padding:2rem;text-align:center">' +
      '<h1 style="color:#9e1b1b">Offline</h1><p>Questa pagina non è ancora stata salvata. · This page has not been saved yet.</p>' +
      '<p><a href="/it/">Lunario dei Frati Patchatori</a> · <a href="/en/">The Patching Friars\' Almanac</a></p></body>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
          event.waitUntil(refreshUpcoming().catch(() => {}));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit ?? offline())),
    );
    return;
  }

  const save = (res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((cache) => cache.put(req, copy));
    }
    return res;
  };

  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(caches.match(req).then((hit) => hit ?? fetch(req).then(save)));
    return;
  }

  if (/^\/(fonts|icons|img)\//.test(url.pathname) || url.pathname === '/favicon.svg') {
    // Stale-while-revalidate: answer from cache right away, fetch the current version for next time.
    event.respondWith(
      caches.match(req).then((hit) => {
        const fresh = fetch(req).then(save);
        if (hit) {
          event.waitUntil(fresh.catch(() => {}));
          return hit;
        }
        return fresh;
      }),
    );
  }
});

// Daily notification: the push carries no data, so look up today's saint in the reader's language
// (saved by the page when they subscribed) and show it.
async function todayNotification() {
  const saved = await caches.match('/__push/lang');
  const lang = saved ? await saved.text() : 'it';
  const now = new Date();
  const mmdd = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  let data = { title: lang === 'it' ? 'Lunario dei Frati Patchatori' : "The Patching Friars' Almanac", body: '', url: `/${lang}/${mmdd}/` };
  try {
    // Never leave a push without a notification: give up on the details after 4 seconds.
    data = await (await fetch(`/push/${lang}/${mmdd}.json`, { signal: AbortSignal.timeout(4000) })).json();
  } catch {}
  // Cache today's page too, so tapping the notification works even on a bad connection.
  caches.open(CACHE).then((cache) => cache.add(`/${lang}/${mmdd}/`)).catch(() => {});
  return self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `santo-${mmdd}`,
    data: { url: data.url },
  });
}

self.addEventListener('push', (event) => event.waitUntil(todayNotification()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const win = wins.find((w) => new URL(w.url).origin === location.origin);
      return win ? win.navigate(url).then((w) => w?.focus()) : self.clients.openWindow(url);
    }),
  );
});
