import { useSyncExternalStore, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useOnline } from '../pwa.tsx'

const PDF = 'pergub-64-2023.pdf'

// Aplikasi terpasang (tanpa bilah browser, jadi tak ada tombol kembali) dan layar sentuh
// (Chrome Android biasanya mengunduh PDF, bukan menampilkannya) memakai penampil di dalam aplikasi.
// Desktop di tab browser memakai penampil bawaan browser yang lebih lengkap.
const QUERY = '(display-mode: standalone), (display-mode: minimal-ui), (display-mode: fullscreen), (pointer: coarse)'

function useDalamAplikasi(): boolean {
  return useSyncExternalStore(
    (kabari) => {
      const m = window.matchMedia(QUERY)
      m.addEventListener('change', kabari)
      return () => m.removeEventListener('change', kabari)
    },
    () => window.matchMedia(QUERY).matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
  )
}

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

export function PdfLink({ halaman, kode, className = '', children, offline }: Props) {
  const online = useOnline()
  const dalamAplikasi = useDalamAplikasi()

  if (!online)
    return (
      <span className={`${className} mati`} title="PDF tidak disimpan untuk offline">
        {offline ?? children}
      </span>
    )
  if (dalamAplikasi)
    return (
      <Link to={`/pdf/${halaman ?? 1}${kode ? `?k=${encodeURIComponent(kode)}` : ''}`} className={className}>
        {children}
      </Link>
    )
  return (
    <a href={`${PDF}${halaman ? `#page=${halaman}` : ''}`} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  )
}
