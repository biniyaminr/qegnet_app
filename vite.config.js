import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/*.png', 'og.jpg'],
    manifest: {
      name: 'ቅኝት Music School', short_name: 'ቅኝት',
      description: 'Learn Ethiopian music through the four kiñit scales.',
      start_url: '/', display: 'standalone', orientation: 'portrait',
      background_color: '#0c130f', theme_color: '#0c130f',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: { globPatterns: ['**/*.{js,css,html,png,json}'], navigateFallback: 'index.html' }
  })]
});
