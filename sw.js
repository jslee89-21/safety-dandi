/* 안전서류 단디 — 최소 서비스워커
   앱 파일 자체가 이미 모든 라이브러리를 내장하고 있어(html2canvas 등)
   별도 캐싱 없이도 대부분 오프라인에서 작동하지만, 이 서비스워커를 통해
   "홈 화면에 추가"가 정식 PWA로 인식되게 하고, 페이지 자체도 캐싱해
   완전한 오프라인 재실행을 보장한다. */
const CACHE_NAME = 'safety-dandi-v1';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
