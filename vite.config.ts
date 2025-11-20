import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

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
