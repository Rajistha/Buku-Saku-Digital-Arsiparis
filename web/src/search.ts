import type { Data, Item } from './data.ts'

export type SearchResult = {
  items: Item[]
  /** kata yang disorot pada nama/uraian */
  terms: string[]
  /** awalan kode yang dicari, untuk disorot pada kolom kode */
  kodePrefix?: string
  mode: 'kode' | 'kata'
  /** terisi bila kueri asli salah ketik dan hasil berasal dari kueri yang diperbaiki */
  corrected?: string
}

const KODE_RE = /^\d[\d.]*$/

/** t harus muncul di awal sebuah kata ("anggaran" tidak cocok dengan "pelanggaran"). */
export function awalKata(h: string, t: string): boolean {
  let i = h.indexOf(t)
  while (i >= 0) {
    if (i === 0 || !/[a-z0-9]/.test(h[i - 1])) return true
    i = h.indexOf(t, i + 1)
  }
  return false
}

/** "000.1" cocok dengan 000.1 dan turunannya, tetapi tidak dengan 000.10. */
function cocokKode(k: string, t: string): boolean {
  const c = t.replace(/\.+$/, '')
  return c.includes('.') || c.length >= 3 ? k === c || k.startsWith(c + '.') : k.startsWith(c)
}

function runWords(d: Data, q: string): { items: Item[]; terms: string[]; kodePrefix?: string } {
  const semua = q.split(' ').filter(Boolean)
  const kodeTerms = semua.filter((t) => KODE_RE.test(t))
  const terms = semua.filter((t) => !KODE_RE.test(t))
  const frasa = terms.join(' ')
  const hit: { it: Item; rank: number; idx: number }[] = []
  d.items.forEach((it, idx) => {
    if (!kodeTerms.every((t) => cocokKode(it.k, t))) return
    if (!terms.every((t) => awalKata(d.hay[idx], t))) return
    const n = it.n.toLowerCase()
    const rank = frasa && n.startsWith(frasa) ? 1 : terms.every((t) => awalKata(n, t)) ? 2 : 3
    hit.push({ it, rank, idx })
  })
  // awal nama > nama > uraian; di dalam kelompok yang sama menurut nomor kode
  hit.sort((a, b) => a.rank - b.rank || a.idx - b.idx)
  return { items: hit.map((h) => h.it), terms, kodePrefix: kodeTerms[0]?.replace(/\.+$/, '') }
}

/** Jarak Levenshtein dengan pemotongan awal bila melebihi batas. */
function dekat(a: string, b: string, maks: number): number {
  if (Math.abs(a.length - b.length) > maks) return maks + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let min = i
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      cur.push(v)
      if (v < min) min = v
    }
    if (min > maks) return maks + 1
    prev = cur
  }
  return prev[b.length]
}

function perbaiki(d: Data, term: string): string | null {
  if (term.length < 4 || KODE_RE.test(term) || d.hay.some((h) => awalKata(h, term))) return null
  const maks = term.length >= 8 ? 2 : 1
  let best: string | null = null
  let bestDist = maks + 1
  let bestFreq = 0
  for (const [w, f] of d.vocab) {
    const dist = dekat(term, w, maks)
    if (dist < bestDist || (dist === bestDist && f > bestFreq)) {
      best = w
      bestDist = dist
      bestFreq = f
    }
  }
  return bestDist <= maks ? best : null
}

export function search(d: Data, raw: string): SearchResult {
  const q = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!q) return { items: [], terms: [], mode: 'kata' }

  // hanya kode: cocokkan awalan kode beserta seluruh turunannya
  if (KODE_RE.test(q)) {
    const c = q.replace(/\.+$/, '')
    return { items: d.items.filter((i) => cocokKode(i.k, c)), terms: [], kodePrefix: c, mode: 'kode' }
  }

  const r = runWords(d, q)
  if (r.items.length) return { ...r, mode: 'kata' }

  // tidak ada hasil: coba perbaiki salah ketik ringan
  const fq = q
    .split(' ')
    .map((t) => perbaiki(d, t) ?? t)
    .join(' ')
  if (fq !== q) {
    const r2 = runWords(d, fq)
    if (r2.items.length) return { ...r2, mode: 'kata', corrected: fq }
  }
  return { ...r, mode: 'kata' }
}
