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
      registerType: 'autoUpdate', // important
      injectRegister: 'auto', // به صورت خودکار register را inject می‌کند
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
        cleanupOutdatedCaches: true, // پاکسازی کش‌های قدیمی
        maximumFileSizeToCacheInBytes: 5000000,
        // این‌ها برای اطمینان از فعال شدن سریع نسخه جدید
        skipWaiting: true,
        clientsClaim: true,
        // Add unique cache ID to ensure service worker changes on each build
        cacheId: cacheId,
        // Don't precache - let NetworkFirst strategy handle everything
        // This ensures we always check the network first
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // Use NetworkFirst for HTML to always check for updates
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // Runtime caching strategies
        runtimeCaching: [
          {
            // NetworkFirst for HTML files - always check network first
            urlPattern: /^https?:\/\/.*\.html$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: `html-cache-${cacheId}`,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // NetworkFirst for root index.html
            urlPattern: /^https?:\/\/[^/]+\/?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: `html-cache-${cacheId}`,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // NetworkFirst for JS/CSS - always check network first for latest version
            urlPattern: /^https?:\/\/.*\.(js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: `static-resources-${cacheId}`,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours (fallback cache)
              },
              networkTimeoutSeconds: 3, // Use cache if network takes > 3 seconds
            },
          },
          {
            // NetworkOnly for API calls - never cache API responses
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: 'NetworkOnly',
            options: {
              cacheName: `api-cache-${cacheId}`,
            },
          },
          {
            // CacheFirst for images - cache images but with shorter expiration
            urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: `image-cache-${cacheId}`,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // برای تولید true نکن؛ فقط در حالت develop اگر لازم است true کن
      },
    }),
  ],
});
