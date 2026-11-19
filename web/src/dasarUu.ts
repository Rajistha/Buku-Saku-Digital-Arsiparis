// Rujukan UU 43/2009 untuk isi Pergub 64/2023 (klasifikasi keamanan/akses dan jadwal retensi). Murni, tanpa DOM, agar bisa diuji.
import { nasibOf, type Aturan } from './data.ts'

export type DasarUu = { pasal: string; teks: string }

/** Klasifikasi keamanan dan akses wajib dibuat pencipta arsip (Pasal 40 ayat 4); arsip tertutup berdasar alasan Pasal 44. */
export function dasarKeamanan(at: Aturan | undefined): DasarUu[] {
  if (!at?.s || at.s === 'X') return []
  const hasil: DasarUu[] = [{ pasal: '40', teks: 'Pasal 40 ayat (4): sistem klasifikasi keamanan dan akses arsip' }]
  if (at.a === 't' || at.s !== 'B') hasil.push({ pasal: '44', teks: 'Pasal 44: alasan arsip boleh ditutup aksesnya' })
  return hasil
}

/** Retensi mengikuti JRA (Pasal 48); musnah mengikuti syarat Pasal 51, permanen berarti arsip statis (Pasal 53 ayat 7). */
export function dasarRetensi(at: Aturan | undefined): DasarUu[] {
  if (!at || !(at.ra || at.ri || at.rk)) return []
  const hasil: DasarUu[] = [{ pasal: '48', teks: 'Pasal 48: kewajiban memiliki jadwal retensi arsip (JRA)' }]
  const n = nasibOf(at.rk)
  if (n === 'musnah' || n === 'kecuali') hasil.push({ pasal: '51', teks: 'Pasal 51: syarat pemusnahan arsip' })
  if (n === 'permanen' || n === 'kecuali') hasil.push({ pasal: '53', teks: 'Pasal 53 ayat (7): arsip statis yang diserahkan' })
  return hasil
}
