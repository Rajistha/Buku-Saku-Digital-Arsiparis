import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { InstallButton, PwaStatus } from '../pwa.tsx'
import type { Peraturan } from '../peraturan.ts'
import { PdfLink } from './PdfLink.tsx'
import { Icon, Logo } from './Icon.tsx'

/** Kerangka satu peraturan: menu, sumber, dan tombol untuk berganti ke peraturan lain. */
export default function Layout({ peraturan }: { peraturan: Peraturan }) {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const menu = peraturan.menu
  const halamanCari = menu[1].to

  // pintasan: "/" atau Ctrl+K membuka pencarian
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const mengetik = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      const ctrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'
      if (ctrlK || (e.key === '/' && !mengetik)) {
        e.preventDefault()
        // di halaman Cari cukup fokus ke kotak cari, jangan hapus kata yang sedang dicari
        if (pathname !== halamanCari) nav(halamanCari)
        window.setTimeout(() => document.getElementById('q')?.focus(), 30)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav, pathname, halamanCari])

  return (
    <div className="app">
      <header className="topnav">
        <Link to={peraturan.beranda} className="brand" aria-label={`Buku Saku Digital Pemprov Bali, ke Beranda ${peraturan.judul}`}>
          <Logo />
          <div>
            <b>{peraturan.judul}</b>
            <small>Buku Saku Digital</small>
          </div>
        </Link>
        <Link to="/" className="btn ghost sm ganti-atas" aria-label="Ganti peraturan">
          <Icon name="swap" />
          Ganti
        </Link>
        <InstallButton className="sm pasang" />
      </header>

      <aside className="sidebar">
        <div className="logo">
          <Logo />
          <div>
            <b>Buku Saku Digital</b>
            <small>Pemprov Bali</small>
          </div>
        </div>
        <nav className="nav" aria-label="Menu utama">
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={m.icon} />
              {m.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="btn ghost ganti">
          <Icon name="swap" />
          Ganti peraturan
        </Link>
        <InstallButton className="side-pasang" />
        <div className="side-note">
          <b>Sumber</b>
          {peraturan.sumber.teks}
          <br />
          <PdfLink peraturan={peraturan.id} halaman={peraturan.sumber.halaman}>
            Buka PDF
          </PdfLink>
        </div>
      </aside>

      <main className="main" id="isi">
        <Outlet />
      </main>

      <PwaStatus />

      <nav className="bnav" aria-label="Menu utama">
        {menu.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name={m.icon} />
            {m.pendek}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
