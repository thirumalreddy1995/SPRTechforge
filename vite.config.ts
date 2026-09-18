import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// One id per build. The app compares it with /version.json to notice a newer
// deploy (see lib/freshBuild.ts).
// CI uses the commit SHA so the scheduled rebuild of an unchanged commit produces
// byte-identical chunks (no needless cache churn); local builds use a timestamp.
const BUILD_ID = (process.env.GITHUB_SHA || '').slice(0, 12) || new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const versionFile = () => ({
  name: 'spr-version-json',
  generateBundle() {
    // @ts-ignore — Rollup plugin context
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: BUILD_ID, builtAt: new Date().toISOString() }) });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), versionFile()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
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
