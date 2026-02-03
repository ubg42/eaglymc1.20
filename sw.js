const CACHE_NAME = 'yeeCache';
let OFFLINE_HTML = '/offline.html';

self.addEventListener('install', (event) => {
    if (self.location.hostname.includes("discordsays.com")) {
        OFFLINE_HTML = '/.proxy/offline.html';
    }
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([OFFLINE_HTML]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', async () => {
    const tabs = await self.clients.matchAll({ type: 'window' });
    tabs.forEach((tab) => {
        tab.navigate(tab.url);
    });
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    url.href = url.href.split("#")[0];

    if (url.hostname.includes("discordsays.com")) {
        if (!url.pathname.startsWith('/.proxy')) {
            url.pathname = '/.proxy' + url.pathname;
            OFFLINE_HTML = '/.proxy/offline.html';
        }
    }

    if (url.href.startsWith('http') && !url.href.includes("onlineCheck")) {
        const rewrittenRequest = new Request(url.href, {
            method: event.request.method,
            headers: event.request.headers,
            mode: event.request.mode,
            credentials: event.request.credentials,
            redirect: event.request.redirect,
            referrer: event.request.referrer,
            referrerPolicy: event.request.referrerPolicy,
            integrity: event.request.integrity,
            cache: event.request.cache,
        });

        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    fetch(rewrittenRequest).then((networkResponse) => {
                        if (networkResponse.ok) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        } else if (url.href.includes(".part")) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.delete(event.request);
                            });
                        }
                    }).catch(() => {});

                    return cachedResponse;
                }

                return fetch(rewrittenRequest).then((networkResponse) => {
                    if (networkResponse.ok) {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    } else {
                        return networkResponse;
                    }
                }).catch((err) => {
                    if (err instanceof TypeError) {
                        return caches.match(OFFLINE_HTML);
                    }
                    throw err;
                });
            })
        );
    }
});
