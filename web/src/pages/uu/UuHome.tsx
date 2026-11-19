import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon.tsx'
import { useTitle } from '../../components/ui.tsx'
import { useUu } from '../../stateUu.tsx'
import { CONTOH_UU, PINTASAN_UU } from '../../uu.ts'

export default function UuHome() {
  const d = useUu()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  useTitle('UU 43/2009 Kearsipan')

  const cari = (v: string) => {
    const t = v.trim()
    nav(t ? `/uu-43-2009/cari?q=${encodeURIComponent(t)}` : '/uu-43-2009/cari')
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    cari(q)
  }

  return (
    <>
      <section className="hero">
        <h1>Cari pasal UU Kearsipan</h1>
        <p>
          {d.pasal.length} pasal dalam {d.bab.length} BAB dari Undang-Undang Nomor 43 Tahun 2009, lengkap dengan penjelasan pasalnya.
        </p>
        <form className="bigsearch" onSubmit={onSubmit} role="search">
          <Icon name="search" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ketik nomor pasal atau kata…"
            aria-label="Cari pasal berdasarkan nomor atau kata"
            autoComplete="off"
          />
          <button type="submit" className="btn primary">
            Cari
          </button>
        </form>
        <div className="coba">
          <span>Coba:</span>
          {CONTOH_UU.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => cari(c)}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="sec" aria-labelledby="h-pintas">
        <div className="section-h">
          <h2 id="h-pintas">Sering dicari</h2>
        </div>
        <div className="recent">
          {PINTASAN_UU.map((p) => (
            <Link key={p.ke} to={p.ke} className="card rcard">
              <div>
                <b>{p.judul}</b>
                <small className="rket">{p.ket}</small>
              </div>
              <Icon name="chev" />
            </Link>
          ))}
        </div>
      </section>

      <section className="sec" aria-labelledby="h-bab">
        <div className="section-h">
          <h2 id="h-bab">Telusuri per BAB</h2>
        </div>
        <div className="bidang">
          {d.bab.map((b) => {
            const ps = d.byBab.get(b.id) ?? []
            return (
              <Link key={b.id} to={`/uu-43-2009/bab/${b.id}`} className="card bcard">
                <div className="top">
                  <span className="bi g000">
                    <Icon name="file" />
                  </span>
                  <span className="kd mono">BAB {b.id}</span>
                </div>
                <div>
                  <b>{b.n}</b>
                  <small>{ps.length === 1 ? `Pasal ${ps[0].p}` : `Pasal ${ps[0].p}–${ps[ps.length - 1].p}`}</small>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
