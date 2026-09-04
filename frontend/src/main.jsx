import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import './i18n';
import App from './App.jsx';

// Register PWA Service Worker for offline support
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('🌸 Smriti Patient Portal is ready for offline operation');
    }
  });
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '413068962989-pv637gaki6ekg1vk9javkb21njg96g4m.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
