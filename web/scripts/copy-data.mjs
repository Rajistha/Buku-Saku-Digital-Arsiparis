// Salin data klasifikasi hasil ekstraksi ke folder publik aplikasi.
// Pakai: npm run data   (setelah menjalankan python ../scripts/extract_klasifikasi.py)
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dari = resolve(root, '..', 'data', 'klasifikasi.json')
const ke = resolve(root, 'public', 'data', 'klasifikasi.json')
mkdirSync(dirname(ke), { recursive: true })
copyFileSync(dari, ke)
console.log('Disalin:', dari, '->', ke)
