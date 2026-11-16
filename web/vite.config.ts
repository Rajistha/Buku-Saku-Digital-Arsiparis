import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react(), isiAlamatSitus()],
})
