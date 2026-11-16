// Model data klasifikasi + indeks. Modul ini murni (tanpa DOM) agar bisa diuji dengan Node.

/** k kode · n nama · u uraian "antara lain" · h halaman PDF · p nomor asli di PDF · c catatan koreksi */
export type Item = { k: string; n: string; u: string; h: number; p?: string; c?: string }

/**
 * Keamanan/akses (Lampiran II) dan retensi (Lampiran III) per kode.
 * s keamanan (B Biasa · T Terbatas · R Rahasia · S Sangat Rahasia · X tergantung jenis arsip yang lebih spesifik)
 * a akses (b Terbuka · t Tertutup · x tergantung) · hs halaman PDF Lampiran II
 * ra retensi aktif · ri retensi inaktif · rk keterangan (nasib akhir) · hr halaman PDF Lampiran III
 * w kode induk bila retensi diwarisi dari kelompoknya
 * q 1 bila nilai retensi di PDF tidak terbaca dengan pasti (hanya rujukan halaman hr yang disimpan)
 */
export type Aturan = {
  s?: 'B' | 'T' | 'R' | 'S' | 'X'
  a?: 'b' | 't' | 'x'
  hs?: number
  ra?: string
  ri?: string
  rk?: string
  hr?: number
  w?: string
  q?: 1
}

export const KEAMANAN: Record<NonNullable<Aturan['s']>, { nama: string; hak: string; dasar: string }> = {
  B: {
    nama: 'Biasa',
    hak: 'Pengguna internal dan eksternal',
    dasar: 'Apabila diketahui oleh publik tidak merugikan siapapun.',
  },
  T: {
    nama: 'Terbatas',
    hak: 'Penentu kebijakan, pengawas internal dan eksternal serta penegak hukum',
    dasar: 'Apabila diketahui oleh pihak yang tidak berhak dapat mengakibatkan terganggunya pelaksanaan tugas dan fungsi lembaga pemerintahan.',
  },
  R: {
    nama: 'Rahasia',
    hak: 'Penentu kebijakan, pengawas internal dan eksternal serta penegak hukum',
    dasar: 'Apabila diketahui oleh pihak yang tidak berhak dapat mengakibatkan terganggunya fungsi penyelenggaraan negara, sumber daya nasional, dan/atau ketertiban umum.',
  },
  S: {
    nama: 'Sangat Rahasia',
    hak: 'Penentu kebijakan, pengawas internal dan eksternal serta penegak hukum',
    dasar: 'Apabila diketahui oleh pihak yang tidak berhak dapat membahayakan kedaulatan negara.',
  },
  X: { nama: 'Tergantung jenis arsip', hak: '', dasar: 'Mengikuti klasifikasi jenis arsip yang lebih spesifik.' },
}

export const AKSES: Record<NonNullable<Aturan['a']>, string> = { b: 'Terbuka', t: 'Tertutup', x: 'Tergantung jenis arsip' }

export type Nasib = 'permanen' | 'musnah' | 'kecuali' | 'lain'

/** Nasib akhir arsip dari kolom Keterangan Lampiran III. */
export function nasibOf(rk: string | undefined): Nasib | null {
  if (!rk) return null
  const t = rk.toLowerCase()
  if (t.startsWith('permanen')) return 'permanen'
  if (t.startsWith('musnah')) return /kecuali|permanen/.test(t) ? 'kecuali' : 'musnah'
  return 'lain'
}

export type Data = {
  items: Item[]
  /** keamanan & retensi per kode; kode tanpa baris di Lampiran II/III tidak ada di sini */
  aturan: Map<string, Aturan>
  byCode: Map<string, Item>
  children: Map<string, Item[]>
  roots: Item[]
  /** huruf kecil: kode + nama + uraian, sejajar dengan items */
  hay: string[]
  /** kata (≥4 huruf) dari nama beserta frekuensinya, untuk koreksi salah ketik */
  vocab: Map<string, number>
  countByBidang: Map<string, number>
}

export const BIDANG_FUNGSI: Record<string, 'Fasilitatif' | 'Substantif'> = {
  '000': 'Fasilitatif',
  '100': 'Substantif',
  '200': 'Substantif',
  '300': 'Substantif',
  '400': 'Substantif',
  '500': 'Substantif',
  '600': 'Substantif',
  '700': 'Substantif',
  '800': 'Fasilitatif',
  '900': 'Fasilitatif',
}

export const CONTOH = ['perjalanan dinas', 'pemberhentian', 'anggaran', 'pengadaan']

export const fmt = (n: number): string => n.toLocaleString('id-ID')

export function parentOf(k: string): string | null {
  const i = k.lastIndexOf('.')
  return i < 0 ? null : k.slice(0, i)
}

export const levelOf = (k: string): number => k.split('.').length
export const bidangOf = (k: string): string => k.slice(0, 3)

export function words(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]{4,}/g) ?? []
}

export function buildData(items: Item[], aturanJson: Record<string, Aturan> = {}): Data {
  const byCode = new Map<string, Item>()
  const children = new Map<string, Item[]>()
  const roots: Item[] = []
  const vocab = new Map<string, number>()
  const countByBidang = new Map<string, number>()

  for (const it of items) {
    byCode.set(it.k, it)
    const p = parentOf(it.k)
    if (p === null) roots.push(it)
    else {
      const arr = children.get(p)
      if (arr) arr.push(it)
      else children.set(p, [it])
    }
    const b = bidangOf(it.k)
    countByBidang.set(b, (countByBidang.get(b) ?? 0) + 1)
    for (const w of words(it.n)) vocab.set(w, (vocab.get(w) ?? 0) + 1)
  }
  const hay = items.map((i) => `${i.k} ${i.n} ${i.u}`.toLowerCase())
  return { items, aturan: new Map(Object.entries(aturanJson)), byCode, children, roots, hay, vocab, countByBidang }
}

/** Dari bidang sampai kode itu sendiri. */
export function ancestors(d: Data, k: string): Item[] {
  const out: Item[] = []
  let cur: string | null = k
  while (cur !== null) {
    const it = d.byCode.get(cur)
    if (it) out.unshift(it)
    cur = parentOf(cur)
  }
  return out
}

export const hasChildren = (d: Data, k: string): boolean => (d.children.get(k)?.length ?? 0) > 0
