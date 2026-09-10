import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Prompter',
        short_name: 'Prompter',
        description:
          'Transforma qualquer celular ou tablet em painel de palco legível e controlável sem as mãos, funcionando offline.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: '#16181c',
        theme_color: '#16181c',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache completo do shell (prompt.md §4) — o app abre 100% offline.
        globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg}'],
      },
    }),
  ],
})
