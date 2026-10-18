// Service worker: makes Cell Quest installable and playable offline, shows
// notifications, and (where the browser supports it) a daily streak reminder.
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';

// The built app files (list injected at build time).
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();

// Google Fonts: the stylesheet changes rarely, the font files never.
registerRoute(({ url }) => url.origin === 'https://fonts.googleapis.com', new StaleWhileRevalidate({ cacheName: 'google-fonts-css' }));
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({ cacheName: 'google-fonts', plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 })] }),
);

// The page asks us to activate a new version when the player taps "Update".
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Tapping a notification opens (or focuses) the app on the right page.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL(e.notification.data?.url || './', self.registration.scope).href;
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      const win = wins.find((w) => w.url.startsWith(self.registration.scope));
      if (win) return win.focus().then((w) => w.navigate(target));
      return self.clients.openWindow(target);
    }),
  );
});

// Daily streak reminder via Periodic Background Sync (installed app on
// Chrome/Edge for Android & desktop). The page stores the last day played
// and the current streak in the 'cq-meta' cache.
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

self.addEventListener('periodicsync', (e) => {
  if (e.tag !== 'streak-reminder') return;
  e.waitUntil(
    (async () => {
      const cache = await caches.open('cq-meta');
      const res = await cache.match('meta/state');
      if (!res) return;
      const { lastPlayed, streak, remindedOn } = await res.json();
      const now = new Date();
      if (lastPlayed === todayKey(now) || remindedOn === todayKey(now) || now.getHours() < 16) return;
      await self.registration.showNotification(streak > 0 ? `Keep your ${streak}-day streak alive! 🔥` : 'Time for a quick Cell Quest round?', {
        body: 'Play today’s Daily Cell Challenge — it takes about 3 minutes.',
        icon: 'pwa-192.png',
        badge: 'pwa-192.png',
        tag: 'streak-reminder',
        data: { url: './#/play/daily' },
      });
      await cache.put('meta/state', new Response(JSON.stringify({ lastPlayed, streak, remindedOn: todayKey(now) })));
    })(),
  );
});
