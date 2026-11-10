/* Die Lernreise ist umgezogen (2026-11-10). Dieser Service Worker ersetzt auf GitHub Pages den alten (der hielt die ganze App
   im Offline-Speicher): er räumt den Speicher weg, übernimmt sofort und lässt alles durchs Netz. Die alte App lädt sich darauf
   neu (app.js → controllerchange) und bekommt so die Umzugsseite index.html. */
self.addEventListener('install', () => self.skipWaiting());
// Seiten immer frisch vom Netz (nicht aus dem Browser-Cache: GitHub Pages erlaubt 10 Minuten) – sonst käme beim Neuladen evtl.
// nochmals die alte App statt der Umzugsseite. Mit Umleitung (kommt hier nicht vor) normal laden.
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request.url, { cache: 'reload', credentials: 'same-origin' })
    .then(r => (r.redirected ? fetch(e.request) : r)).catch(() => fetch(e.request)));
});
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('lernreise-')) await caches.delete(k);
  await self.clients.claim();
})()));
