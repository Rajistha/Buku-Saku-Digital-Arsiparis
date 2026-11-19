import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon, Logo } from '../components/Icon.tsx'
import { useTitle } from '../components/ui.tsx'
import { PERATURAN } from '../peraturan.ts'
import { tutupSplash } from '../splash.ts'

/** Halaman awal: pilih peraturan dulu, baru masuk ke isinya. */
export default function Pilih() {
  useTitle('')
  useEffect(() => tutupSplash(), [])
  return (
    <main className="pilih" id="isi">
      <header className="pilih-head">
        <div className="pilih-logo">
          <Logo />
        </div>
        <h1>Buku Saku Digital</h1>
        <p>Pemprov Bali. Pilih peraturan yang ingin dibuka.</p>
      </header>
      <div className="pilih-grid">
        {PERATURAN.map((p) => (
          <Link key={p.id} to={p.beranda} className="card pcard">
            <span className="pcard-ik">
              <Icon name={p.ikon} />
            </span>
            <span className="pcard-isi">
              <b>{p.judul}</b>
              <small>{p.tentang}</small>
            </span>
            <span className="pcard-aksi">
              {p.aksi}
              <Icon name="chev" />
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
