export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.info('نسخه جدید PWA آماده شد. با رفرش، نسخه جدید فعال می شود.');
          }
        });
      });
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  });
}
