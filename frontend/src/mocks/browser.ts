import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function enableMocking() {
  // Proactively unregister any legacy service workers
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.active && reg.active.scriptURL.includes('mockServiceWorker.js')) {
          console.log('[AgriMitra] Unregistering legacy MSW worker:', reg.active.scriptURL);
          await reg.unregister();
        }
      }
    } catch (e) {
      console.warn('[AgriMitra] Service worker check warning:', e);
    }
  }

  // MSW is STRICTLY DISABLED in production builds and whenever VITE_USE_MSW is not explicitly 'true'
  if (import.meta.env.PROD || import.meta.env.VITE_USE_MSW !== 'true') {
    return;
  }

  // Only start in local development if explicitly enabled
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}
