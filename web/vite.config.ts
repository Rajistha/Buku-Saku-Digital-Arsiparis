import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Alamat situs untuk tag og:image dan og:url. Pratinjau tautan (WhatsApp, LinkedIn, X)
 * butuh URL lengkap, jadi __SITE_URL__ di index.html diganti saat build.
 * Variabel otomatis hosting sengaja tidak dipakai: di Vercel isinya alamat *.vercel.app,
 * bukan domain sendiri, sehingga gambar pratinjau menunjuk ke alamat yang salah.
 * Untuk pindah domain, ubah ALAMAT_SITUS atau build dengan SITE_URL=https://... npm run build
 */
const ALAMAT_SITUS = 'https://buku-saku.rajistha.my.id'

function siteUrl(): string {
  return (process.env.SITE_URL || ALAMAT_SITUS).replace(/\/+$/, '')
}

function isiAlamatSitus(): Plugin {
  return {
    name: 'isi-alamat-situs',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl()),
  }
}

// base './' agar hasil build bisa dibuka dari sub-folder mana pun (Netlify, GitHub Pages, dsb.)
export default defineConfig({
  base: './',
  plugins: [
    react(),
    isiAlamatSitus(),
    VitePWA({
      // pengguna diberi tahu bila ada versi baru, bukan dimuat ulang diam-diam
      registerType: 'prompt',
      // ikon sudah tercakup oleh globPatterns; tanpa ini setiap ikon tercatat dua kali
      includeManifestIcons: false,
      manifest: {
        name: 'Buku Saku Digital Pemprov Bali',
        short_name: 'Buku Saku',
        description: 'Cari kode klasifikasi arsip beserta keamanan dan retensinya dari Pergub Bali No. 64/2023.',
        lang: 'id',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#F5F6FD',
        theme_color: '#5468E7',
        icons: [
          { src: 'logo-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'logo-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // aplikasi + data klasifikasi disimpan untuk offline.
        // PDF (7 MB) dan gambar pratinjau tautan sengaja tidak ikut agar unduhan awal tetap ringan.
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // penampil PDF (pdf.js, ±0,5 MB) hanya berguna saat online, jadi tidak ikut disimpan
        globIgnores: ['**/*.pdf', '**/og-image.jpg', '**/assets/PdfViewer-*.js'],
        navigateFallback: 'index.html',
        // PDF dibuka di tab baru (sebuah navigasi). Tanpa pengecualian ini service worker
        // mengembalikan index.html sehingga yang terbuka malah aplikasinya, bukan PDF.
        navigateFallbackDenylist: [/\.pdf(\?.*)?$/i],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'font-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-berkas',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
