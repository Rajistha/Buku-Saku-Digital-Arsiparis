// Uji data dan pencarian UU 43/2009 terhadap data asli. Jalankan: npm test
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dasarKeamanan, dasarRetensi } from './dasarUu.ts'
import { buildUu, cariUu, type BerkasUu } from './uu.ts'

const d = buildUu(JSON.parse(readFileSync(new URL('../public/data/uu-43-2009.json', import.meta.url), 'utf8')) as BerkasUu)
let n = 0
const ok = (nama: string, fn: () => void) => {
  fn()
  n++
  console.log('  ✓', nama)
}

ok('92 pasal berurutan dalam 11 BAB', () => {
  assert.equal(d.bab.length, 11)
  assert.deepEqual(d.pasal.map((p) => Number(p.p)), Array.from({ length: 92 }, (_, i) => i + 1))
})
ok('setiap pasal punya isi, BAB yang ada, dan halaman PDF yang masuk akal', () => {
  for (const p of d.pasal) {
    assert.ok(p.t.length > 0, `Pasal ${p.p} kosong`)
    assert.ok(d.babById.has(p.b), `Pasal ${p.p} BAB ${p.b}`)
    assert.ok(p.h >= 3 && p.h <= p.he && p.he <= 56, `Pasal ${p.p} hlm ${p.h}-${p.he}`)
  }
})
ok('pasal rujukan pintasan cocok dengan isinya', () => {
  assert.match(d.byNo.get('44')!.t[0], /menutup akses/)
  assert.match(d.byNo.get('51')!.t[0], /Pemusnahan arsip/)
  assert.match(d.byNo.get('66')!.t[0], /25 \(dua puluh lima\) tahun/)
  assert.match(d.byNo.get('56')!.t[0], /program arsip vital/)
  assert.equal(d.byNo.get('81')!.b, 'IX')
  assert.equal(d.byNo.get('88')!.b, 'IX')
  assert.match(d.byNo.get('48')!.t[0], /wajib memiliki JRA/)
})
ok('judul paragraf tidak ikut masuk isi pasal', () => {
  for (const p of d.pasal) for (const t of p.t) assert.doesNotMatch(t, /^Paragraf \d/)
  assert.match(d.byNo.get('41')!.bg, /Paragraf 1: Penciptaan/)
  assert.match(d.byNo.get('56')!.bg, /Paragraf 4: Arsip Vital/)
})
ok('cari nomor: "44" dan "pasal 44" menaruh Pasal 44 paling atas', () => {
  assert.equal(cariUu(d, '44').items[0].p, '44')
  assert.equal(cariUu(d, 'Pasal 44').items[0].p, '44')
  assert.equal(cariUu(d, '4').items[0].p, '4')
})
ok('cari kata: isi pasal didahulukan dari penjelasan', () => {
  const r = cariUu(d, 'pemusnahan')
  assert.ok(r.items.length > 3)
  assert.ok(r.items.some((p) => p.p === '51'))
  // definisi JRA ada di Pasal 1; Pasal 48 hanya menyebut singkatannya
  assert.equal(cariUu(d, 'jadwal retensi').items[0].p, '1')
  assert.equal(cariUu(d, 'JRA').items.some((p) => p.p === '48'), true)
})
ok('cari kata tanpa hasil dan kueri kosong', () => {
  assert.equal(cariUu(d, 'zzzzqq').items.length, 0)
  assert.equal(cariUu(d, '  ').items.length, 0)
})

ok('dasar hukum dari Pergub menunjuk pasal yang ada dan sesuai', () => {
  const semua = [
    ...dasarKeamanan({ s: 'T', a: 't' }),
    ...dasarKeamanan({ s: 'B', a: 'b' }),
    ...dasarRetensi({ ra: '1 Tahun', ri: '1 Tahun', rk: 'Musnah' }),
    ...dasarRetensi({ ra: '2 Tahun', ri: '3 Tahun', rk: 'Permanen' }),
    ...dasarRetensi({ rk: 'Musnah, Kecuali Notula' }),
  ]
  for (const x of semua) assert.ok(d.byNo.has(x.pasal), `Pasal ${x.pasal} tidak ada`)
  assert.deepEqual(dasarKeamanan({ s: 'B', a: 'b' }).map((x) => x.pasal), ['40'])
  assert.deepEqual(dasarKeamanan({ s: 'T', a: 't' }).map((x) => x.pasal), ['40', '44'])
  assert.deepEqual(dasarRetensi({ rk: 'Musnah', ra: '1 Tahun' }).map((x) => x.pasal), ['48', '51'])
  assert.deepEqual(dasarRetensi({ rk: 'Permanen', ra: '1 Tahun' }).map((x) => x.pasal), ['48', '53'])
  assert.deepEqual(dasarKeamanan(undefined), [])
  assert.match(d.byNo.get('53')!.t.join(' '), /dipermanenkan/)
})

console.log(`\n${n} uji UU lulus`)
