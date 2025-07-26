import React      from 'react';
import ReactDOM   from 'react-dom/client';
import App        from './App';

/** ────────────────────────────────────────────────
 *  Mount React
 *  ─────────────────────────────────────────────── */
ReactDOM
  .createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

/** ────────────────────────────────────────────────
 *  DEV-only helpers (exposed on window for console)
 *  ─────────────────────────────────────────────── */
if (import.meta.env.DEV) {
  // ➊  inspect env vars in DevTools →  window.ENV
  (window as any).ENV = import.meta.env;

  // ➋  call Supabase fetch in DevTools →  await window.fetchTemplates()
  import('@/services/marketplace').then(m => {
    (window as any).fetchTemplates = m.fetchPublicTemplates;
  });
}
