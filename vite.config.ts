import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for assets on GitHub Pages
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Vendor libraries change far less often than app code. Keeping them
        // in their own files means a returning visitor re-downloads only the
        // small app chunk after a deploy; the browser serves React/Firebase
        // from cache. All chunks are <link rel=modulepreload>ed by Vite, so
        // they download in parallel — no extra round trip on first visit.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/storage'],
          'vendor-firebase-lite': ['firebase/firestore/lite'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
