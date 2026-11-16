// Uji sederhana pencarian terhadap data asli. Jalankan: npm test
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ancestors, buildData, hasChildren, levelOf, parentOf, type Item } from './data.ts'
import { search } from './search.ts'

const items = JSON.parse(readFileSync(new URL('../public/data/klasifikasi.json', import.meta.url), 'utf8')) as Item[]
const d = buildData(items)
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

console.log(`\n${n} uji lulus`)
