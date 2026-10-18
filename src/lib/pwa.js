// Web-app helpers: install prompt, service-worker updates, notifications,
// the app-icon badge and the data the streak reminder needs.
import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

// ---------- Install ----------
// Chrome/Edge/Android fire `beforeinstallprompt` once, possibly before React
// mounts, so we capture it at module load.
let installEvent = null;
const installListeners = new Set();
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  installListeners.forEach((fn) => fn());
});
window.addEventListener('appinstalled', () => {
  installEvent = null;
  installListeners.forEach((fn) => fn());
});

export const isInstalled = () => window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// { canPrompt, installed, ios, install() }
export function useInstall() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    installListeners.add(fn);
    return () => installListeners.delete(fn);
  }, []);
  return {
    canPrompt: !!installEvent,
    installed: isInstalled(),
    ios: isIOS(),
    install: async () => {
      if (!installEvent) return false;
      installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      installEvent = null;
      installListeners.forEach((fn) => fn());
      return outcome === 'accepted';
    },
  };
}

// ---------- Updates ----------
// A new version waits until the player taps "Update" (never mid-quiz).
let applyUpdate = null;
const updateListeners = new Set();
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateListeners.forEach((fn) => fn(true));
    },
  });
}

export function useUpdateAvailable() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    updateListeners.add(setReady);
    return () => updateListeners.delete(setReady);
  }, []);
  return { ready, update: () => applyUpdate?.(true) };
}

// ---------- Notifications ----------
export const notifySupported = () => 'Notification' in window;
export const notifyPermission = () => (notifySupported() ? Notification.permission : 'unsupported');

export async function askNotifyPermission() {
  if (!notifySupported()) return 'unsupported';
  const result = await Notification.requestPermission();
  if (result === 'granted') registerStreakReminder();
  return result;
}

// Shows a system notification (uses the service worker so it also works on
// Android, where `new Notification()` is not allowed).
export async function systemNotify(title, { body, url = './', tag } = {}) {
  if (notifyPermission() !== 'granted') return false;
  const options = { body, tag, icon: 'pwa-192.png', badge: 'pwa-192.png', data: { url } };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

// Number on the app icon (installed app, supported browsers).
export function setAppBadge(n) {
  try {
    if (n > 0) navigator.setAppBadge?.(n);
    else navigator.clearAppBadge?.();
  } catch {
    /* not supported */
  }
}

// ---------- Streak reminder ----------
// Periodic Background Sync lets the service worker wake up roughly daily
// (installed app on Chrome/Edge only). Elsewhere the reminder shows when the
// player opens the app.
export async function registerStreakReminder() {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (!reg?.periodicSync) return false;
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (status.state !== 'granted') return false;
    await reg.periodicSync.register('streak-reminder', { minInterval: 12 * 60 * 60 * 1000 });
    return true;
  } catch {
    return false;
  }
}

// Shares the last day played and streak with the service worker.
export async function saveStreakState(lastPlayed, streak) {
  try {
    const cache = await caches.open('cq-meta');
    const old = await cache.match('meta/state');
    const remindedOn = old ? (await old.json()).remindedOn : null;
    await cache.put('meta/state', new Response(JSON.stringify({ lastPlayed, streak, remindedOn })));
  } catch {
    /* caches unavailable (private mode) */
  }
}
