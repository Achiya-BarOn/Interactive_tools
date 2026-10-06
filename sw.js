// Network first, so an online visit always gets the latest version;
// the cache is only the fallback that lets the app open offline.
var CACHE = "point-vs-vector-v2";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function(evt){
  evt.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(evt){
  evt.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(evt){
  var req = evt.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  evt.respondWith(
    fetch(req).then(function(res){
      if (res.ok){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req, { ignoreSearch:true });
    })
  );
});
