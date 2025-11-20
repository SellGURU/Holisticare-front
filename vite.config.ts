import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'fs';

// Get package version and build identifier
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const buildId = (process.env as any).VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 
                (process.env as any).VERCEL_DEPLOYMENT_ID || 
                Date.now().toString();
const cacheId = `holisticare-v${packageJson.version}-${buildId}`;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // 🔥 This disables all caching + ensures instant updates
      selfDestroying: true,

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

      // 🚫 Completely disable precaching & runtime caching
      workbox: {
        globPatterns: [],   // no precaching
        runtimeCaching: [], // no runtime caching
        skipWaiting: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false,
      },
    }),
  ],
});
