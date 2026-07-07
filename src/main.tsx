/**
 * Vite entry point for the DAChess frontend.
 * React 18+ createRoot with strict mode.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');

// Fast-path for uptime monitoring (UptimeRobot, etc.) without heavy React rendering
if (window.location.pathname === '/ping' || window.location.pathname === '/health') {
  if (rootElement) {
    rootElement.innerHTML = 'OK';
  }
} else {
  if (!rootElement) {
    throw new Error(
      'Root element not found. Ensure index.html contains <div id="root"></div>.'
    );
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
