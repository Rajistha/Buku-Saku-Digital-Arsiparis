import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BidangIcon, Icon } from '../components/Icon.tsx'
import { getRecent, useTitle } from '../components/ui.tsx'
import { CONTOH, fmt, type Item } from '../data.ts'
import { useData } from '../state.tsx'

export default function Home() {
  const d = useData()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  useTitle('')

  const recent = useMemo(
    () => getRecent().map((k) => d.byCode.get(k)).filter((x): x is Item => !!x).slice(0, 4),
    [d],
  )

  const cari = (v: string) => {
    const t = v.trim()
    nav(t ? `/cari?q=${encodeURIComponent(t)}` : '/cari')
  }
  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    cari(q)
  }

  return (
    <>
      <section className="hero">
        <h1>Cari kode klasifikasi arsip</h1>
        <p>{fmt(d.items.length)} kode klasifikasi dari Pergub Bali Nomor 64 Tahun 2023, lengkap dengan keamanan, akses, dan retensinya.</p>
        <form className="bigsearch" onSubmit={onSubmit} role="search">
          <Icon name="search" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ketik kode atau nama…"
            aria-label="Cari kode atau nama klasifikasi"
            autoComplete="off"
          />
          <button type="submit" className="btn primary">
            Cari
          </button>
        </form>
        <div className="coba">
          <span>Coba:</span>
          {CONTOH.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => cari(c)}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="sec" aria-labelledby="h-bidang">
        <div className="section-h">
          <h2 id="h-bidang">Telusuri per bidang</h2>
        </div>
        <div className="bidang">
          {d.roots.map((b) => (
            <Link key={b.k} to={`/telusur/${b.k}`} className="card bcard">
              <div className="top">
                <BidangIcon kode={b.k} />
                <span className="kd mono">{b.k}</span>
              </div>
              <div>
                <b>{b.n}</b>
                <small>{fmt(d.countByBidang.get(b.k) ?? 0)} kode</small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec" aria-labelledby="h-recent">
        <div className="section-h">
          <h2 id="h-recent">Terakhir dilihat</h2>
        </div>
        {recent.length ? (
          <div className="recent">
            {recent.map((it) => (
              <Link key={it.k} to={`/telusur/${it.k}`} className="card rcard">
                <div>
                  <span className="mono">{it.k}</span>
                  <b>{it.n}</b>
                </div>
                <Icon name="chev" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty-note">Belum ada. Jenis arsip yang Anda buka akan muncul di sini (disimpan di perangkat ini saja).</p>
        )}
      </section>
    </>
  )
}
