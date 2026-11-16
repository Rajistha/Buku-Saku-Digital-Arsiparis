import type { CSSProperties } from 'react'
import { Logo } from './Icon.tsx'

/** Blok abu berdenyut sebagai pengganti isi yang sedang dimuat. */
export function Skel({ w, h = 14, r, className = '', style }: { w?: number | string; h?: number | string; r?: number | string; className?: string; style?: CSSProperties }) {
  return <span className={`skel ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />
}

/** Kerangka seluruh aplikasi (menu + isi) selagi data klasifikasi diunduh, dengan susunan yang sama seperti Layout. */
export function AppSkeleton() {
  return (
    <div className="app" role="status" aria-label="Memuat data klasifikasi">
      <header className="topnav">
        <div className="brand">
          <Logo />
          <div>
            <b>Buku Saku Digital</b>
            <small>Pemprov Bali</small>
          </div>
        </div>
      </header>
      <aside className="sidebar">
        <div className="logo">
          <Logo />
          <div>
            <b>Buku Saku Digital</b>
            <small>Pemprov Bali</small>
          </div>
        </div>
        <nav className="nav sk-nav" aria-hidden="true">
          {[120, 100, 150, 110].map((w, i) => (
            <div key={i} className="sk-nav-it">
              <Skel w={18} h={18} r={6} />
              <Skel w={w} h={13} />
            </div>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="sk-head">
          <Skel w={240} h={28} r={10} />
          <Skel w="min(380px, 80%)" h={13} />
        </div>
        <Skel h={56} r={16} className="sk-cari" />
        <div className="sk-daftar">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="sk-baris">
              <Skel w={74} h={14} />
              <div className="sk-teks">
                <Skel w={`${58 - (i % 3) * 9}%`} h={14} />
                <Skel w={`${34 + (i % 2) * 14}%`} h={11} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

/** Kerangka penampil PDF: bilah atas + selembar halaman kosong. */
export function PdfSkeleton({ pesan }: { pesan?: string }) {
  return (
    <div className="pdfv" role="status" aria-label={pesan ?? 'Memuat penampil PDF'}>
      <header className="pdfv-bar" aria-hidden="true">
        <Skel w={84} h={32} r={10} />
        <div className="pdfv-judul">
          <Skel w={150} h={14} />
        </div>
        <Skel w={150} h={34} r={10} />
      </header>
      <div className="pdfv-area">
        <div className="pdfv-halaman">
          <div className="pdfv-kerangka skel" />
        </div>
      </div>
    </div>
  )
}
