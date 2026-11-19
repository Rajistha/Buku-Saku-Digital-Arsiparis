import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useOnline } from '../pwa.tsx'
import { PERATURAN_UTAMA } from '../peraturan.ts'

type Props = {
  /** id peraturan (lihat peraturan.ts); bawaannya Pergub 64/2023 */
  peraturan?: string
  /** nomor halaman PDF yang dituju */
  halaman?: number
  /** rujukan asal (kode klasifikasi atau nomor pasal), untuk ditampilkan di penampil dan sebagai tujuan tombol Kembali */
  kode?: string
  className?: string
  children: ReactNode
  /** isi saat offline (PDF tidak disimpan untuk offline); bawaannya sama dengan children */
  offline?: ReactNode
}

// PDF selalu dibuka di penampil dalam aplikasi (zoom, geser, tombol Kembali), baik di HP, aplikasi terpasang,
// maupun desktop. Di aplikasi terpasang tak ada bilah browser, dan Chrome Android biasanya mengunduh PDF
// alih-alih menampilkannya, jadi satu penampil untuk semua perangkat paling konsisten.
export function PdfLink({ peraturan = PERATURAN_UTAMA.id, halaman, kode, className = '', children, offline }: Props) {
  const online = useOnline()

  if (!online)
    return (
      <span className={`${className} mati`} title="PDF tidak disimpan untuk offline">
        {offline ?? children}
      </span>
    )
  return (
    <Link to={`/pdf/${peraturan}/${halaman ?? 1}${kode ? `?k=${encodeURIComponent(kode)}` : ''}`} className={className}>
      {children}
    </Link>
  )
}
