import { defineConfig }   from 'vite';
import react              from '@vitejs/plugin-react';
import tsconfigPaths      from 'vite-tsconfig-paths';

export default defineConfig({
  root: 'gui',                 // keeps all existing behaviour
  plugins: [
    react(),                   // JSX / Fast-refresh
    tsconfigPaths()            // <<< reads tsconfig.paths.json
  ],
  resolve: {
    alias: {
      '@': '/src',             // fallback for runtime (browser)
      '~': '/src'
    }
  },
  server: {                    // Vite dev server
    port: 5180,
    strictPort: true
  }
});
