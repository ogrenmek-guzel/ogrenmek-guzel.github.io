// Made by tools/build.py: do not edit.
const CACHE = 'site-74ad94baf052';
const FILES = [
  "./",
  "./app.js",
  "./english/",
  "./english/index.html",
  "./english/private/",
  "./english/private/index.html",
  "./english/school/",
  "./english/school/index.html",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./index.html",
  "./manifest.webmanifest",
  "./math/",
  "./math/09-butun-yarim-ceyrek/",
  "./math/09-butun-yarim-ceyrek/index.html",
  "./math/09-butun-yarim-ceyrek/lesson-01-butun-yarim-ceyrek/",
  "./math/09-butun-yarim-ceyrek/lesson-01-butun-yarim-ceyrek/draw.js",
  "./math/09-butun-yarim-ceyrek/lesson-01-butun-yarim-ceyrek/index.html",
  "./math/09-butun-yarim-ceyrek/lesson-01-butun-yarim-ceyrek/lesson.css",
  "./math/09-butun-yarim-ceyrek/lesson-01-butun-yarim-ceyrek/lesson.js",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers.pdf",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek.pdf",
  "./math/index.html",
  "./robots.txt",
  "./style.css"
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok && !res.redirected) cache.put(req, res.clone());
      return res;
    } catch (err) {
      return (await cache.match('./')) || Response.error();
    }
  }));
});
