/* Service worker: permite instalar la app y usarla sin internet.
   Estrategia: red primero (siempre la última versión) y, si no hay conexión, lo guardado. */
const CACHE = 'entrenador-academico-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css',
  'js/util.js', 'js/crypto.js', 'js/state.js', 'js/capacity.js', 'js/planner.js', 'js/wellbeing.js',
  'js/syllabus.js', 'js/actions.js', 'js/views.js', 'js/app.js',
  'vendor/pdf.min.js', 'vendor/pdf.worker.min.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
