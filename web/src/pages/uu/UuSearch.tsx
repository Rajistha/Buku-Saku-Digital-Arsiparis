import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/Icon.tsx'
import { Highlight, useTitle } from '../../components/ui.tsx'
import { fmt } from '../../data.ts'
import { useUu } from '../../stateUu.tsx'
import { CONTOH_UU, cariUu, cuplikUu, type Pasal } from '../../uu.ts'

const HALAMAN = 40

function Baris({ p, terms, babNama }: { p: Pasal; terms: string[]; babNama: string }) {
  return (
    <div className="r">
      <Link to={`/uu-43-2009/pasal/${p.p}`} className="r-main">
        <span className="kode mono">Pasal {p.p}</span>
        <div className="r-t">
          <b className="uu-cuplik">
            <Highlight text={cuplikUu(p, terms)} terms={terms} />
          </b>
          <small>
            BAB {p.b} · {babNama}
          </small>
        </div>
        <span className="pg">hlm {p.h}</span>
      </Link>
      <Link to={`/uu-43-2009/pasal/${p.p}`} className="act" tabIndex={-1} aria-hidden="true">
        <Icon name="chev" />
      </Link>
    </div>
  )
}

export default function UuSearch() {
  const d = useUu()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [batas, setBatas] = useState(HALAMAN)
  useTitle(q ? `Cari “${q}” · UU 43/2009` : 'Cari Pasal · UU 43/2009')

  const hasil = useMemo(() => cariUu(d, q), [d, q])
  const ubah = (v: string) => {
    setBatas(HALAMAN)
    setParams(v ? { q: v } : {}, { replace: true })
  }

  return (
    <>
      <div className="page-head">
        <h1>Cari Pasal</h1>
        <p>Ketik nomor pasal atau kata dari isi pasal dan penjelasannya.</p>
      </div>

      <div className="search" role="search">
        <Icon name="search" />
        <input
          id="q"
          autoFocus
          value={q}
          onChange={(e) => ubah(e.target.value)}
          placeholder="Ketik nomor pasal atau kata…"
          aria-label="Cari pasal berdasarkan nomor atau kata"
          autoComplete="off"
        />
        {q && (
          <button type="button" className="x" onClick={() => ubah('')} aria-label="Hapus pencarian">
            <Icon name="x" />
          </button>
        )}
      </div>

      {!q.trim() ? (
        <div className="kosong">
          <b>Mulai mengetik untuk mencari</b>
          Ketik <span className="mono">44</span> untuk membuka Pasal 44, atau kata dari isi pasal, mis. “pemusnahan”.
          <div className="kosong-act">
            {CONTOH_UU.map((c) => (
              <button key={c} type="button" className="chip" onClick={() => ubah(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="meta">
            <h2 aria-live="polite">{fmt(hasil.items.length)} pasal</h2>
            <span className="muted">untuk “{q.trim()}”</span>
          </div>

          {hasil.items.length === 0 ? (
            <div className="kosong">
              <b>Tidak ada hasil</b>
              Coba kata yang lebih umum, atau ketik nomor pasal antara 1 dan {d.pasal.length}.
              <div className="kosong-act">
                <Link to="/uu-43-2009/daftar" className="btn ghost">
                  Lihat daftar isi
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="res">
                {hasil.items.slice(0, batas).map((p) => (
                  <Baris key={p.p} p={p} terms={hasil.terms} babNama={d.babById.get(p.b)?.n ?? ''} />
                ))}
              </div>
              {hasil.items.length > batas && (
                <button type="button" className="btn ghost more" onClick={() => setBatas((b) => b + HALAMAN)}>
                  Tampilkan lebih banyak ({fmt(hasil.items.length - batas)} lagi)
                </button>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
