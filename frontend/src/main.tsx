import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n/config';
import { enableMocking } from './mocks/browser';

async function bootstrap() {
  // Proactively unregister any legacy MSW service workers from browser cache
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.active && reg.active.scriptURL.includes('mockServiceWorker.js')) {
          console.log('[AgriMitra] Removing legacy MSW worker before app init:', reg.active.scriptURL);
          await reg.unregister();
        }
      }
    } catch (e) {
      console.warn('[AgriMitra] Service worker cleanup note:', e);
    }
  }

  // Only start MSW if in development mode AND explicitly requested
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true') {
    try {
      await enableMocking();
    } catch (err) {
      console.warn('MSW worker could not start, continuing with direct API:', err);
    }
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
