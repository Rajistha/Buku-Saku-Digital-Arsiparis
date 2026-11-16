import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Alamat situs untuk tag og:image dan og:url. Pratinjau tautan (WhatsApp, LinkedIn, X)
 * butuh URL lengkap, jadi __SITE_URL__ di index.html diganti saat build dari:
 *   SITE_URL      diisi sendiri, mis. SITE_URL=https://bukusaku.netlify.app npm run build
 *   URL           otomatis di Netlify
 *   VERCEL_PROJECT_PRODUCTION_URL   otomatis di Vercel
 */
function siteUrl(): string {
  const e = process.env
  const raw = e.SITE_URL || e.URL || (e.VERCEL_PROJECT_PRODUCTION_URL ? `https://${e.VERCEL_PROJECT_PRODUCTION_URL}` : '')
  return raw.replace(/\/+$/, '')
}

function isiAlamatSitus(): Plugin {
  let peringatan = false
  return {
    name: 'isi-alamat-situs',
    transformIndexHtml(html, ctx) {
      const url = siteUrl()
      if (!url && !ctx.server && !peringatan) {
        peringatan = true
        this.warn('SITE_URL belum diisi: gambar pratinjau tautan (og:image) tidak akan muncul. Lihat README bagian "Gambar pratinjau tautan".')
      }
      // tanpa alamat, pakai jalur relatif agar tetap valid saat pengembangan
      return html.replaceAll('__SITE_URL__', url || '.')
    },
  }
}

// base './' agar hasil build bisa dibuka dari sub-folder mana pun (Netlify, GitHub Pages, dsb.)
export default defineConfig({
  base: './',
  plugins: [react(), isiAlamatSitus()],
})
