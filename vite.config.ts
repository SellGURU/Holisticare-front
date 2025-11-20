/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Generate unique build ID to ensure service worker changes on each build
const buildId =
  (process.env as any).VERCEL_GIT_COMMIT_SHA?.substring(0, 7) ||
  (process.env as any).VERCEL_DEPLOYMENT_ID ||
  Date.now().toString();

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Holisticare',
        short_name: 'Holisticare',
        description: '',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Disable precaching to prevent install hangs
        globPatterns: [],
        // No runtime caching - always fetch fresh from network
        runtimeCaching: [],
        // Critical: These ensure immediate activation
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Add unique cache ID to ensure service worker changes on each build
        cacheId: `holisticare-${buildId}`,
        // Remove navigateFallback since we're not precaching
        // This prevents the "non-precached-url" error
        navigateFallback: undefined,
        navigateFallbackDenylist: undefined,
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
});