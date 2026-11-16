// Salin data hasil ekstraksi ke folder publik aplikasi.
// Pakai: npm run data   (setelah menjalankan skrip di ../scripts, lihat scripts/bangun_aturan.py)
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
for (const nama of ['klasifikasi.json', 'aturan.json']) {
  const dari = resolve(root, '..', 'data', nama)
  const ke = resolve(root, 'public', 'data', nama)
  mkdirSync(dirname(ke), { recursive: true })
  copyFileSync(dari, ke)
  console.log('Disalin:', dari, '->', ke)
}
