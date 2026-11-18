import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import type { Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

function todayJsonPlugin(): Plugin {
  const generate = () => {
    const result = spawnSync(process.execPath, ['scripts/build-today.mjs'], {
      stdio: 'inherit',
    })
    if (result.status !== 0) {
      throw new Error('Failed to write public/today.json')
    }
  }
  return {
    name: 'today-json',
    buildStart: generate,
    configureServer: generate,
  }
}

const theme = '#10130e'

export default defineConfig({
  base: '/snn-daily/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    todayJsonPlugin(),
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'today.json'],
      manifest: {
        name: 'First Spike',
        short_name: 'First Spike',
        description: 'A morning course in spiking neural networks, grounded in the papers.',
        theme_color: theme,
        background_color: theme,
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/snn-daily/',
        scope: '/snn-daily/',
        lang: 'en',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
