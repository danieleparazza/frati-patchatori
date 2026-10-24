// Service worker: makes the almanac installable and readable offline.
// - Pages: network first, falling back to the last copy (so new saints and fixes show up when online).
// - Static files (/_astro, fonts, icons, images): cache first, they are immutable or rarely change.
// - On install, the next seven days in both languages are cached, so the app works offline for a week.
const CACHE = 'frati-v1';

function upcomingDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.now() + i * 86400000);
    days.push(String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  }
  return days;
}

self.addEventListener('install', (event) => {
  const pages = ['/it/', '/en/', ...upcomingDays(7).flatMap((d) => [`/it/${d}/`, `/en/${d}/`])];
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled(pages.map((p) => cache.add(p))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
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
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit ?? offline())),
    );
    return;
  }

  if (/^\/(_astro|fonts|icons|img)\//.test(url.pathname) || url.pathname === '/favicon.svg') {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ??
          fetch(req).then((res) => {
            if (res.ok) caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
            return res;
          }),
      ),
    );
  }
});
