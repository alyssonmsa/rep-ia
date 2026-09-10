import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Relativo de propósito: GitLab/GitHub Pages de projeto servem o site num
  // subcaminho (ex.: usuario.gitlab.io/rep-ia/), não na raiz do domínio.
  // Com base relativa o build funciona em qualquer subcaminho sem precisar
  // saber o nome do projeto de antemão.
  base: './',
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
        start_url: '.',
        scope: '.',
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
