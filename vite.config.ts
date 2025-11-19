import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',    // important
      injectRegister: 'auto',       // به صورت خودکار register را inject می‌کند
      manifest: {
        name: 'Holisticare',
        short_name: 'Holisticare',
        description: '',
        theme_color: '#ffffff',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true, // پاکسازی کش‌های قدیمی
        maximumFileSizeToCacheInBytes: 5000000,
        // این‌ها برای اطمینان از فعال شدن سریع نسخه جدید
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false, // برای تولید true نکن؛ فقط در حالت develop اگر لازم است true کن
      }
    }),
  ],
});

