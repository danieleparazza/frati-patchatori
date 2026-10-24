// Service worker: makes the almanac installable and readable offline.
// - Pages: network first, falling back to the last copy (so new saints and fixes show up when online).
// - Static files (/_astro, fonts, icons, images): cache first, they are immutable or rarely change.
// - On install, the next seven days in both languages are cached, so the app works offline for a week.
const CACHE = 'frati-v2';
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

// Daily notification: the push carries no data, so look up today's saint in the reader's language
// (saved by the page when they subscribed) and show it.
async function todayNotification() {
  const saved = await caches.match('/__push/lang');
  const lang = saved ? await saved.text() : 'it';
  const now = new Date();
  const mmdd = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  let data = { title: lang === 'it' ? 'Lunario dei Frati Patchatori' : "The Patching Friars' Almanac", body: '', url: `/${lang}/${mmdd}/` };
  try {
    data = await (await fetch(`/push/${lang}/${mmdd}.json`)).json();
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
