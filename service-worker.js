const CACHE_NAME = 'estoque-pwa-v1';
const urlsToCache = [
    './', // A própria raiz do app (index.html)
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icon-192x192.png', // Certifique-se de ter esses ícones!
    './icons/icon-512x512.png'
    // Adicione aqui outros arquivos estáticos que você queira cachear
];

// Evento de instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalação');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Armazenando arquivos no cache:', urlsToCache);
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Falha ao cachear arquivos durante a instalação', error);
            })
    );
});

// Evento de 'fetch' (intercepta requisições de rede)
self.addEventListener('fetch', (event) => {
    // Para todas as requisições, tenta buscar do cache primeiro
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Se encontrar no cache, retorna a resposta do cache
                if (response) {
                    console.log('Service Worker: Retornando do cache:', event.request.url);
                    return response;
                }
                // Se não encontrar no cache, faz a requisição à rede
                console.log('Service Worker: Buscando da rede:', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        // Opcional: Clona a resposta da rede e a armazena no cache para futuras requisições
                        return caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    })
                    .catch(() => {
                        // Se a requisição falhar (offline), você pode retornar uma página offline customizada
                        // Por exemplo, uma página 'offline.html' que informa que o usuário está offline
                        // if (event.request.mode === 'navigate') { // Verifica se é uma navegação de página
                        //     return caches.match('/offline.html');
                        // }
                        console.warn('Service Worker: Falha na requisição de rede e não encontrado no cache:', event.request.url);
                        // Você pode retornar uma resposta genérica ou um erro aqui
                        return new Response('<h1>Você está offline e esta página não foi cacheada.</h1>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
            })
    );
});

// Evento de ativação do Service Worker (limpa caches antigos)
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Ativação');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Apagando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});