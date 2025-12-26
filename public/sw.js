// Service Worker para PWA
const CACHE_NAME = 'adventure-crm-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/vite.svg'
]

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache aberto')
        return cache.addAll(urlsToCache)
      })
  )
})

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Estratégia: Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta é válida, clonamos e armazenamos no cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })
        }
        return response
      })
      .catch(() => {
        // Se falhar, tentamos buscar do cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response
            }
            // Se não encontrar no cache e for uma navegação, retorna index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html')
            }
          })
      })
  )
})

