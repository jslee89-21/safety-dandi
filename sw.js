/* 안전서류 단디 — 서비스워커
   ⚠️ 이전 버전은 "저장된 파일을 무조건 먼저 보여주는" 방식이라, GitHub에
   새 버전을 올려도 계속 예전 화면이 보이는 문제가 있었음. 이제는 "인터넷이
   되면 항상 최신 파일을 받아오고, 인터넷이 안 될 때만 저장된 파일로 대체"
   하는 방식으로 바꿔서, 평소엔 항상 최신 버전이 보이고 오프라인일 때만
   저장된 버전으로 안전하게 작동하게 함 */
const CACHE_NAME = 'safety-dandi-v2';
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
    fetch(event.request)
      .then((response) => {
        // 최신 파일을 성공적으로 받아오면, 다음 오프라인 대비용으로 캐시도 갱신
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))  // 인터넷 안 될 때만 저장된 파일 사용
  );
});
