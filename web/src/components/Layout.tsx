import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { InstallButton, PwaStatus } from '../pwa.tsx'
import { PdfLink } from './PdfLink.tsx'
import { Icon, Logo } from './Icon.tsx'

const MENU = [
  { to: '/', label: 'Beranda', icon: 'home', end: true },
  { to: '/cari', label: 'Cari Kode', icon: 'search', end: false },
  { to: '/telusur', label: 'Telusur Klasifikasi', icon: 'tree', end: false },
  { to: '/tentang', label: 'Tentang Data', icon: 'info', end: false },
]
const MENU_PENDEK = ['Beranda', 'Cari', 'Telusur', 'Tentang']

export default function Layout() {
  const nav = useNavigate()
  const { pathname } = useLocation()

  // pintasan: "/" atau Ctrl+K membuka pencarian
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const mengetik = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      const ctrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'
      if (ctrlK || (e.key === '/' && !mengetik)) {
        e.preventDefault()
        // di halaman Cari cukup fokus ke kotak cari, jangan hapus kata yang sedang dicari
        if (pathname !== '/cari') nav('/cari')
        window.setTimeout(() => document.getElementById('q')?.focus(), 30)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav, pathname])

  return (
    <div className="app">
      <header className="topnav">
        <Link to="/" className="brand" aria-label="Buku Saku Digital Pemprov Bali, ke Beranda">
          <Logo />
          <div>
            <b>Buku Saku Digital</b>
            <small>Pemprov Bali</small>
          </div>
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
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={m.icon} />
              {m.label}
            </NavLink>
          ))}
        </nav>
        <InstallButton className="side-pasang" />
        <div className="side-note">
          <b>Sumber</b>
          Pergub Bali No. 64 Tahun 2023, Lampiran I–III (hlm 11–893).
          <br />
          <PdfLink halaman={11}>Buka PDF</PdfLink>
        </div>
      </aside>

      <main className="main" id="isi">
        <Outlet />
      </main>

      <PwaStatus />

      <nav className="bnav" aria-label="Menu utama">
        {MENU.map((m, i) => (
          <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name={m.icon} />
            {MENU_PENDEK[i]}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
