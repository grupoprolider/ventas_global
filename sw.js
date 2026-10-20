const CACHE_NAME = 'gpl-cache-v1789743200441';

self.addEventListener('install', (event) => {
    // Instalación rápida sin esperar
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Reclama el control inmediatamente y purga cachés viejas
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Modo online-first: siempre intentar ir a la red primero,
    // necesario para no trabar las consultas a Supabase ni las actualizaciones.
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
