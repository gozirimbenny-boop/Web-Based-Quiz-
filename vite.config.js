import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base './' keeps asset paths relative, so the build works on GitHub Pages
// under any repo name (the app uses HashRouter, so no server routing needed).
export default defineConfig({
  plugins: [
    react(),
    // Installable web app: manifest + our own service worker (src/sw.js).
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      manifest: {
        name: 'Cell Quest',
        short_name: 'Cell Quest',
        description: 'Learn cells and organelles through quizzes, puzzles, diagrams and friendly duels.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#fdf5d3',
        theme_color: '#0f5c43',
        categories: ['education', 'games'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Daily Cell Challenge', url: './#/play/daily', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: '10-Minute Quick Quiz', url: './#/play/quick', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Friends', url: './#/friends', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
        ],
      },
    }),
  ],
  base: './',
});
