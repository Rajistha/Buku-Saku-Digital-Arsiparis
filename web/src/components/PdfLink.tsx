import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useOnline } from '../pwa.tsx'

type Props = {
  /** nomor halaman PDF yang dituju */
  halaman?: number
  /** kode klasifikasi asal, untuk ditampilkan di penampil dan sebagai tujuan tombol Kembali */
  kode?: string
  className?: string
  children: ReactNode
  /** isi saat offline (PDF tidak disimpan untuk offline); bawaannya sama dengan children */
  offline?: ReactNode
}

// PDF selalu dibuka di penampil dalam aplikasi (zoom, geser, tombol Kembali), baik di HP, aplikasi terpasang,
// maupun desktop. Di aplikasi terpasang tak ada bilah browser, dan Chrome Android biasanya mengunduh PDF
// alih-alih menampilkannya, jadi satu penampil untuk semua perangkat paling konsisten.
export function PdfLink({ halaman, kode, className = '', children, offline }: Props) {
  const online = useOnline()

  if (!online)
    return (
      <span className={`${className} mati`} title="PDF tidak disimpan untuk offline">
        {offline ?? children}
      </span>
    )
  return (
    <Link to={`/pdf/${halaman ?? 1}${kode ? `?k=${encodeURIComponent(kode)}` : ''}`} className={className}>
      {children}
    </Link>
  )
}
