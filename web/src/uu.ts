import { awalKata } from './search.ts'

/** UU 43/2009. Bentuk berkas data/uu-43-2009.json, dibuat oleh scripts/extract_uu.py */
export type Bab = { id: string; n: string; h: number }
export type Pasal = {
  /** nomor pasal */
  p: string
  /** id BAB */
  b: string
  /** bagian dan paragraf */
  bg: string
  /** halaman PDF awal dan akhir */
  h: number
  he: number
  /** isi, satu elemen per ayat/butir */
  t: string[]
  /** penjelasan (kosong bila "Cukup jelas") */
  pj: string[]
}
export type BerkasUu = { bab: Bab[]; pasal: Pasal[]; halaman: { awal: number; penjelasan: number; akhir: number } }

export type UuData = BerkasUu & {
  byNo: Map<string, Pasal>
  byBab: Map<string, Pasal[]>
  babById: Map<string, Bab>
  /** teks huruf kecil per pasal untuk pencarian: hayIsi hanya isi, hay isi + penjelasan */
  hay: string[]
  hayIsi: string[]
}

export function buildUu(b: BerkasUu): UuData {
  const byBab = new Map<string, Pasal[]>()
  for (const p of b.pasal) byBab.set(p.b, [...(byBab.get(p.b) ?? []), p])
  const hayIsi = b.pasal.map((p) => p.t.join(' ').toLowerCase())
  return {
    ...b,
    byNo: new Map(b.pasal.map((p) => [p.p, p])),
    byBab,
    babById: new Map(b.bab.map((x) => [x.id, x])),
    hayIsi,
    hay: b.pasal.map((p, i) => hayIsi[i] + ' ' + p.pj.join(' ').toLowerCase()),
  }
}

export type HasilUu = { items: Pasal[]; terms: string[]; mode: 'nomor' | 'kata' }

/** "44" atau "pasal 44": pasal itu dahulu. Selain itu semua kata harus muncul (di awal kata), isi pasal didahulukan dari penjelasan. */
export function cariUu(d: UuData, raw: string): HasilUu {
  const q = raw.toLowerCase().replace(/\s+/g, ' ').trim()
  if (!q) return { items: [], terms: [], mode: 'kata' }
  const nomor = /^(?:pasal\s*)?(\d{1,2})$/.exec(q)
  if (nomor) {
    const n = nomor[1]
    const ada = d.byNo.get(n)
    const lain = d.pasal.filter((p) => p.p !== n && p.p.startsWith(n))
    return { items: ada ? [ada, ...lain] : lain, terms: [], mode: 'nomor' }
  }
  const terms = q.replace(/^pasal\s+/, '').split(' ').filter(Boolean)
  const hit: { p: Pasal; rank: number; i: number }[] = []
  d.pasal.forEach((p, i) => {
    if (!terms.every((t) => awalKata(d.hay[i], t))) return
    hit.push({ p, rank: terms.every((t) => awalKata(d.hayIsi[i], t)) ? 1 : 2, i })
  })
  hit.sort((a, b) => a.rank - b.rank || a.i - b.i)
  return { items: hit.map((h) => h.p), terms, mode: 'kata' }
}

/** Butir isi pasal yang memuat kata cari (atau butir pertama yang cukup panjang), dipotong di sekitar kata itu. */
export function cuplikUu(p: Pasal, terms: string[], maks = 180): string {
  const butir = p.t.find((x) => terms.some((t) => awalKata(x.toLowerCase(), t))) ?? p.t.find((x) => x.length > 40) ?? p.t[0] ?? ''
  if (butir.length <= maks) return butir
  const low = butir.toLowerCase()
  const pos = terms.map((t) => low.indexOf(t)).filter((x) => x >= 0)
  const awal = pos.length ? Math.max(0, Math.min(...pos) - 50) : 0
  return (awal > 0 ? '…' : '') + butir.slice(awal, awal + maks) + (awal + maks < butir.length ? '…' : '')
}

/** Pintasan topik yang sering dicari; nomor pasalnya sudah dicocokkan dengan teks UU. */
export const PINTASAN_UU: { judul: string; ke: string; ket: string }[] = [
  { judul: 'Penutupan akses arsip', ke: '/uu-43-2009/pasal/44', ket: 'Pasal 44 · alasan arsip boleh ditutup' },
  { judul: 'Syarat pemusnahan arsip', ke: '/uu-43-2009/pasal/51', ket: 'Pasal 51 · habis retensi, sesuai JRA' },
  { judul: 'Jadwal retensi arsip (JRA)', ke: '/uu-43-2009/pasal/48', ket: 'Pasal 48 · wajib dimiliki dan ditetapkan' },
  { judul: 'Arsip statis terbuka', ke: '/uu-43-2009/pasal/66', ket: 'Pasal 66 · dibuka setelah 25 tahun' },
  { judul: 'Program arsip vital', ke: '/uu-43-2009/pasal/56', ket: 'Pasal 56 · identifikasi hingga pemulihan' },
  { judul: 'Ketentuan pidana', ke: '/uu-43-2009/bab/IX', ket: 'BAB IX · Pasal 81–88' },
]

export const CONTOH_UU = ['44', 'retensi', 'pemusnahan', 'akses', 'arsip vital']
