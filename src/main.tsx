import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito';
import '@fontsource-variable/baloo-2';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Development only: a handle for testers to inspect and move state from the console.
if (import.meta.env.DEV) {
  void import('./store').then(({ useStore, useUi }) => {
    (window as unknown as Record<string, unknown>).__letitbe = { useStore, useUi };
  });
}

// Offline support for the installed app. Skipped in development so edits show up at once.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
