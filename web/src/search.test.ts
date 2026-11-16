// Uji sederhana pencarian terhadap data asli. Jalankan: npm test
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ancestors, buildData, hasChildren, KEAMANAN, levelOf, nasibOf, parentOf, type Aturan, type Item } from './data.ts'
import { search } from './search.ts'

const items = JSON.parse(readFileSync(new URL('../public/data/klasifikasi.json', import.meta.url), 'utf8')) as Item[]
const aturan = JSON.parse(readFileSync(new URL('../public/data/aturan.json', import.meta.url), 'utf8')) as Record<string, Aturan>
const d = buildData(items, aturan)
let n = 0
const ok = (nama: string, fn: () => void) => {
  fn()
  n++
  console.log('  ✓', nama)
}

ok('jumlah data sesuai ekstraksi', () => {
  assert.equal(items.length, 2989)
  assert.equal(d.roots.length, 10)
  assert.equal(new Set(items.map((i) => i.k)).size, items.length, 'kode harus unik')
})

ok('setiap kode (selain bidang) punya induk', () => {
  for (const it of items) {
    const p = parentOf(it.k)
    if (p !== null) assert.ok(d.byCode.has(p), `induk ${p} dari ${it.k} hilang`)
  }
})

ok('jumlah per bidang cocok dengan PRD', () => {
  const exp: Record<string, number> = { '000': 235, '100': 75, '200': 88, '300': 41, '400': 736, '500': 1306, '600': 285, '700': 18, '800': 120, '900': 85 }
  for (const [b, c] of Object.entries(exp)) assert.equal(d.countByBidang.get(b), c, b)
})

ok('kata "perjalanan dinas" → 8 hasil (2 kelompok + 6 jenis arsip)', () => {
  const r = search(d, 'perjalanan dinas')
  assert.equal(r.items.length, 8)
  assert.deepEqual(r.items.map((i) => i.k), ['000.1.2', '000.1.2.1', '000.1.2.2', '000.1.2.3', '000.1.3', '000.1.3.1', '000.1.3.2', '000.1.3.3'])
  assert.equal(r.items.filter((i) => hasChildren(d, i.k)).length, 2)
})

ok('awalan kode "000.1.2" → kode itu + 3 anak, bukan 000.1.20', () => {
  const r = search(d, '000.1.2')
  assert.deepEqual(r.items.map((i) => i.k), ['000.1.2', '000.1.2.1', '000.1.2.2', '000.1.2.3'])
  assert.equal(r.mode, 'kode')
})

ok('"000.1" tidak ikut menarik 000.10', () => {
  const r = search(d, '000.1')
  assert.ok(r.items.every((i) => i.k === '000.1' || i.k.startsWith('000.1.')))
  assert.ok(r.items.length > 20)
})

ok('"000" → seluruh bidang 000 (235)', () => {
  assert.equal(search(d, '000').items.length, 235)
})

ok('kata yang belum selesai diketik ("perjalana dinas") tetap ketemu tanpa koreksi', () => {
  const r = search(d, 'perjalana dinas')
  assert.equal(r.corrected, undefined)
  assert.equal(r.items.length, 8)
})

ok('salah ketik "perjalnan dinas" dan "pemberhentan" diperbaiki', () => {
  const r = search(d, 'perjalnan dinas')
  assert.equal(r.corrected, 'perjalanan dinas')
  assert.equal(r.items.length, 8)
  assert.equal(search(d, 'pemberhentan').corrected, 'pemberhentian')
})

ok('kata tak dikenal → kosong', () => {
  assert.equal(search(d, 'zzzzqqq').items.length, 0)
})

ok('huruf besar/kecil dan spasi ganda diabaikan', () => {
  assert.equal(search(d, '  PERJALANAN   Dinas ').items.length, 8)
})

ok('kata hanya cocok di awal kata: "anggaran" tidak menarik "pelanggaran"', () => {
  const r = search(d, 'anggaran')
  assert.ok(r.items.length > 10)
  assert.ok(r.items.every((i) => /(^|[^a-z0-9])anggaran/.test(`${i.n} ${i.u}`.toLowerCase())), 'ada hasil yang bukan awal kata')
  assert.ok(!r.items.some((i) => /pelanggaran/i.test(i.n) && !/(^|[^a-z0-9])anggaran/i.test(i.n + ' ' + i.u)))
})

ok('kueri campuran "000.1 perjalanan" tidak menarik 000.10', () => {
  const r = search(d, '000.1 perjalanan')
  assert.equal(r.items.length, 8)
  assert.ok(r.items.every((i) => i.k.startsWith('000.1.')))
  assert.equal(r.kodePrefix, '000.1')
  assert.deepEqual(r.terms, ['perjalanan'])
})

ok('kueri kode memberi awalan untuk disorot', () => {
  assert.equal(search(d, '000.5.').kodePrefix, '000.5')
})

ok('uraian "antara lain" ikut dicari', () => {
  const r = search(d, 'panitia penilai')
  assert.ok(r.items.some((i) => i.k === '000.5.6.2'))
})

ok('jalur induk 000.5.6.2', () => {
  assert.deepEqual(ancestors(d, '000.5.6.2').map((i) => i.k), ['000', '000.5', '000.5.6', '000.5.6.2'])
  assert.equal(levelOf('000.5.6.2'), 4)
})

ok('baris yang dikoreksi menyimpan nomor asli', () => {
  const x = d.byCode.get('400.2.3.4')
  assert.equal(x?.p, '400.4.3.4')
  assert.equal(items.filter((i) => i.c).length, 10)
})

ok('setiap kode pada data keamanan/retensi ada di klasifikasi', () => {
  for (const k of Object.keys(aturan)) assert.ok(d.byCode.has(k), `${k} tidak ada di Lampiran I`)
})

ok('cakupan keamanan dan retensi pada jenis arsip', () => {
  const daun = items.filter((i) => !hasChildren(d, i.k))
  const kea = daun.filter((i) => aturan[i.k]?.s).length
  const ret = daun.filter((i) => aturan[i.k]?.rk || aturan[i.k]?.q).length
  assert.ok(kea >= 2420, `keamanan ${kea}`)
  assert.ok(ret >= 2400, `retensi ${ret}`)
})

ok('jumlah kategori keamanan sesuai Lampiran II', () => {
  const hitung = (s: string) => Object.values(aturan).filter((a) => a.s === s).length
  assert.equal(hitung('R'), 16)
  assert.equal(hitung('S'), 4)
  assert.equal(hitung('X'), 1)
  assert.ok(hitung('B') > 2000 && hitung('T') > 350)
  for (const a of Object.values(aturan)) if (a.s) assert.ok(a.s in KEAMANAN)
})

ok('contoh nilai: 000.1.1 Telekomunikasi', () => {
  assert.deepEqual(aturan['000.1.1'], { s: 'B', a: 'b', hs: 150, ra: '1 Tahun', ri: '1 Tahun', rk: 'Musnah', hr: 640 })
})

ok('nilai retensi yang ditampilkan berpola jelas; sisanya hanya rujukan halaman', () => {
  for (const [k, a] of Object.entries(aturan)) {
    if (a.q) {
      assert.ok(a.hr && !a.ra && !a.ri && !a.rk, `${k} bertanda ragu tetapi berisi nilai`)
    } else if (a.rk !== undefined) {
      assert.match(a.ra ?? '', /^\d+ Tahun/, `${k} aktif`)
      assert.match(a.ri ?? '', /^\d+ Tahun$/, `${k} inaktif`)
      assert.match(a.rk, /^(Permanen|Musnah)/, `${k} keterangan`)
    }
  }
})

ok('penomoran huruf berlanjut aa, ab, … terbaca (500.4.4.27 dan seterusnya)', () => {
  assert.ok(aturan['500.4.4.27']?.rk, '500.4.4.27 punya keterangan')
  assert.ok(aturan['500.4.4.49']?.rk, '500.4.4.49 punya keterangan')
})

ok('nasib akhir', () => {
  assert.equal(nasibOf('Permanen'), 'permanen')
  assert.equal(nasibOf('Musnah'), 'musnah')
  assert.equal(nasibOf('Musnah, Kecuali Evaluasi Permanen'), 'kecuali')
  assert.equal(nasibOf(undefined), null)
})

console.log(`\n${n} uji lulus`)
