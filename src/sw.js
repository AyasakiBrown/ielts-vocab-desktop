// Service worker — makes the PWA work offline after the first WiFi load.
// Pages: stale-while-revalidate — served instantly from cache, refreshed in the
//        background so the NEXT open gets new code + fresh __INITIAL_STATE__
//        (no version bump needed for the phone to catch up while online).
// Assets (dict/emoji/images/icons): cache-first (big, rarely change; version bump refreshes).
// /data and /sync* always go to the network (never cached).
var C = "ielts-pwa-v31";
var SHELL = ["/", "/index.html", "/review.html", "/edef.html", "/edef.js", "/p1.html", "/vj.html", "/scene.html", "/notebook.html", "/wrong.html",
             "/mistakes.js", "/srs.js", "/dict.js", "/defs.js", "/emoji.js", "/images.js", "/icon-180.png", "/manifest.webmanifest"];
var PAGES = ["/", "/index.html", "/review.html", "/edef.html", "/p1.html", "/vj.html", "/scene.html", "/notebook.html", "/wrong.html"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(C).then(function(c){
    return Promise.all(SHELL.map(function(u){ return c.add(u).catch(function(){}); }));  // individual → one failure won't abort the rest
  }));
  self.skipWaiting();
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== C; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var p = new URL(e.request.url).pathname;
  if (p === "/data" || p === "/sync" || p === "/ping") return; // sync/probe endpoints: network only
  if (PAGES.indexOf(p) >= 0) {
    // stale-while-revalidate: answer from cache instantly, refresh the copy in background
    e.respondWith(caches.match(e.request).then(function(cached){
      var fresh = fetch(e.request).then(function(resp){
        if (resp && resp.status === 200) { var cp = resp.clone(); caches.open(C).then(function(c){ c.put(e.request, cp); }); }
        return resp;
      }).catch(function(){ return null; });
      if (cached) { e.waitUntil(fresh); return cached; }
      return fresh.then(function(r){ return r || caches.match("/index.html"); });
    }));
    return;
  }
  // assets: cache-first → the app runs fully standalone on the phone
  e.respondWith(
    caches.match(e.request).then(function(r){
      if (r) return r;
      return fetch(e.request).then(function(resp){
        if (resp && resp.status === 200) { var cp = resp.clone(); caches.open(C).then(function(c){ c.put(e.request, cp); }); }
        return resp;
      }).catch(function(){ return caches.match("/index.html"); });
    })
  );
});
