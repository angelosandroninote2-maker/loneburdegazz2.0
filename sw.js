/* Service worker: tiene una copia del sito per aprirlo anche con rete lenta. Le pagine si prendono prima dalla rete, così gli aggiornamenti arrivano subito. */
var NAME = 'lbg-v1';
var SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(NAME).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== NAME; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;          /* Firebase e Google restano fuori dalla copia */
  e.respondWith(fetch(r).then(function (res) {
    var copy = res.clone();
    caches.open(NAME).then(function (c) { c.put(r, copy); });
    return res;
  }).catch(function () { return caches.match(r).then(function (m) { return m || caches.match('./'); }); }));
});
