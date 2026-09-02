/* Davide Scuderi — service worker. Tiene in cache il guscio dell'app così si apre
   anche senza rete; i contenuti li chiede sempre prima alla rete, e se la rete
   manca mostra l'ultima copia. Per pubblicare un guscio nuovo si alza VERSIONE. */
var VERSIONE = "davide-scuderi-v4";
var GUSCIO = ["./", "./index.html", "./app.css?v=4", "./app.js?v=3", "./manifest.webmanifest",
  "../assets/config.js", "./icona-192.png", "./icona-512.png",
  "../img/duau.jpg", "../img/senzaveli.jpg", "../img/prenditi.jpg"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSIONE).then(function(c){ return c.addAll(GUSCIO); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){ return n !== VERSIONE; }).map(function(n){ return caches.delete(n); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // rete prima, cache dopo: i contenuti e il guscio si aggiornano appena c'è rete
  e.respondWith(
    fetch(req).then(function(risp){
      var copia = risp.clone();
      caches.open(VERSIONE).then(function(c){ c.put(req, copia); });
      return risp;
    }).catch(function(){
      return caches.match(req, {ignoreSearch:true}).then(function(r){ return r || caches.match("./index.html"); });
    })
  );
});
