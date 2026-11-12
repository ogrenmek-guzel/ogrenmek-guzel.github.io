// Made by tools/build.py: do not edit.
const CACHE = 'site-ad1bdae67baf';
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
  "./math/09-butun-yarim-ceyrek/lesson-01-kesfedelim/",
  "./math/09-butun-yarim-ceyrek/lesson-01-kesfedelim/index.html",
  "./math/09-butun-yarim-ceyrek/lesson-01-kesfedelim/lesson.css",
  "./math/09-butun-yarim-ceyrek/lesson-01-kesfedelim/lesson.js",
  "./math/09-butun-yarim-ceyrek/lesson-02-alistirmalar/",
  "./math/09-butun-yarim-ceyrek/lesson-02-alistirmalar/draw.js",
  "./math/09-butun-yarim-ceyrek/lesson-02-alistirmalar/index.html",
  "./math/09-butun-yarim-ceyrek/lesson-02-alistirmalar/lesson.css",
  "./math/09-butun-yarim-ceyrek/lesson-02-alistirmalar/lesson.js",
  "./math/09-butun-yarim-ceyrek/pdf/explainer-01-butun-yarim-ceyrek/",
  "./math/09-butun-yarim-ceyrek/pdf/explainer-01-butun-yarim-ceyrek/index.html",
  "./math/09-butun-yarim-ceyrek/pdf/explainer-01-butun-yarim-ceyrek/page-1.png",
  "./math/09-butun-yarim-ceyrek/pdf/explainer-01-butun-yarim-ceyrek/page-2.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/index.html",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/page-1.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/page-2.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/page-3.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/page-4.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/page-5.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/page-6.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek-answers/page-7.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/index.html",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/page-1.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/page-2.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/page-3.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/page-4.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/page-5.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/page-6.png",
  "./math/09-butun-yarim-ceyrek/pdf/worksheet-01-butun-yarim-ceyrek/page-7.png",
  "./math/index.html",
  "./robots.txt",
  "./style.css"
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(FILES.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
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
      const res = await fetch(req.url, { cache: 'no-cache' });
      if (res.ok && !res.redirected) cache.put(req, res.clone());
      return res;
    } catch (err) {
      return (await cache.match('./')) || Response.error();
    }
  }));
});
