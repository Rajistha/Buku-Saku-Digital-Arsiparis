import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { CopyButton, Highlight, useTitle } from '../components/ui.tsx'
import { ancestors, CONTOH, fmt, hasChildren, type Data, type Item } from '../data.ts'
import { awalKata, search } from '../search.ts'
import { useData } from '../state.tsx'

const HALAMAN = 60
type Saring = 'semua' | 'jenis' | 'kelompok'

/** Potongan uraian di sekitar kata yang cocok. */
function cuplik(teks: string, terms: string[]): string {
  const t = teks.replace(/^antara lain:?\s*/i, '')
  if (t.length <= 120) return t
  const low = t.toLowerCase()
  const pos = terms.map((x) => low.indexOf(x)).filter((x) => x >= 0)
  const awal = pos.length ? Math.max(0, Math.min(...pos) - 40) : 0
  return (awal > 0 ? '…' : '') + t.slice(awal, awal + 120) + (awal + 120 < t.length ? '…' : '')
}

function Row({ it, d, terms, kodePrefix }: { it: Item; d: Data; terms: string[]; kodePrefix?: string }) {
  const anak = d.children.get(it.k)?.length ?? 0
  const ke = `/telusur/${it.k}`
  const jalur = ancestors(d, it.k)
    .slice(0, -1)
    .slice(-2)
    .map((a) => `${a.k} ${a.n}`)
    .join(' › ')
  // cocok hanya lewat uraian: tampilkan potongan uraian agar jelas kenapa muncul
  const lewatUraian = terms.length > 0 && !!it.u && !terms.every((t) => awalKata(it.n.toLowerCase(), t))
  const pre = kodePrefix && it.k.startsWith(kodePrefix) ? kodePrefix : ''

  return (
    <div className={'r' + (anak ? ' group' : '')}>
      <Link to={ke} className="r-main">
        <span className="kode mono">
          {pre ? (
            <>
              <mark>{pre}</mark>
              {it.k.slice(pre.length)}
            </>
          ) : (
            it.k
          )}
        </span>
        <div className="r-t">
          <b>
            <Highlight text={it.n} terms={terms} />
          </b>
          {lewatUraian && (
            <small className="snip">
              Uraian: <Highlight text={cuplik(it.u, terms)} terms={terms} />
            </small>
          )}
          <small>{jalur || 'Bidang'}</small>
        </div>
        {anak ? <span className="lv">Kelompok · {anak} turunan</span> : <span className="pg">hlm {it.h}</span>}
      </Link>
      {anak ? (
        <Link to={ke} className="act" tabIndex={-1} aria-hidden="true">
          <Icon name="chev" />
        </Link>
      ) : (
        <CopyButton kode={it.k} className="act" />
      )}
    </div>
  )
}

export default function Search() {
  const d = useData()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [saring, setSaring] = useState<Saring>('semua')
  const [batas, setBatas] = useState(HALAMAN)

  const hasil = useMemo(() => search(d, q), [d, q])
  const jumlahKelompok = useMemo(() => hasil.items.filter((i) => hasChildren(d, i.k)).length, [d, hasil])
  const jumlahJenis = hasil.items.length - jumlahKelompok
  const tampil = useMemo(
    () => hasil.items.filter((i) => (saring === 'semua' ? true : saring === 'kelompok' ? hasChildren(d, i.k) : !hasChildren(d, i.k))),
    [d, hasil, saring],
  )

  useEffect(() => setBatas(HALAMAN), [q, saring])
  useTitle(q.trim() || 'Cari Kode')

  const ubah = (v: string) => (v ? setParams({ q: v }, { replace: true }) : setParams({}, { replace: true }))
  const chip = (id: Saring, label: string, n: number) => (
    <button type="button" className={'chip' + (saring === id ? ' on' : '')} aria-pressed={saring === id} onClick={() => setSaring(id)}>
      {label} {fmt(n)}
    </button>
  )

  return (
    <>
      <div className="page-head">
        <h1>Cari Kode</h1>
        <p>Ketik awalan kode atau kata dari nama arsip.</p>
      </div>

      <div className="search" role="search">
        <Icon name="search" />
        <input
          id="q"
          autoFocus
          value={q}
          onChange={(e) => ubah(e.target.value)}
          placeholder="Ketik kode atau nama…"
          aria-label="Cari kode atau nama klasifikasi"
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
          Ketik <span className="mono">000.5</span> untuk melihat semua turunannya, atau kata dari nama arsip, mis. “pemberhentian”.
          <div className="kosong-act">
            {CONTOH.map((c) => (
              <button key={c} type="button" className="chip" onClick={() => ubah(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="meta">
            <h2 aria-live="polite">{fmt(hasil.items.length)} hasil</h2>
            <span className="muted">untuk “{hasil.corrected ?? q.trim()}”</span>
            <span className="sp" />
            {hasil.items.length > 0 && (
              <>
                {chip('semua', 'Semua', hasil.items.length)}
                {chip('jenis', 'Jenis arsip', jumlahJenis)}
                {chip('kelompok', 'Kelompok', jumlahKelompok)}
              </>
            )}
          </div>

          {hasil.corrected && (
            <p className="koreksi">
              Tidak ada hasil untuk “{q.trim()}”. Menampilkan hasil untuk “{hasil.corrected}”.{' '}
              <button type="button" className="link" onClick={() => ubah(hasil.corrected!)}>
                Pakai kata ini
              </button>
            </p>
          )}

          {hasil.items.length === 0 ? (
            <div className="kosong">
              <b>Tidak ada hasil</b>
              Coba kata yang lebih umum, atau ketik awalan kode seperti <span className="mono">400.7</span>.
              <div className="kosong-act">
                <Link to="/telusur" className="btn ghost">
                  Telusuri per bidang
                </Link>
              </div>
            </div>
          ) : tampil.length === 0 ? (
            <div className="kosong">
              <b>Tidak ada {saring === 'jenis' ? 'jenis arsip' : 'kelompok'} pada hasil ini</b>
              <div className="kosong-act">
                <button type="button" className="btn ghost" onClick={() => setSaring('semua')}>
                  Tampilkan semua hasil
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="res">
                {tampil.slice(0, batas).map((it) => (
                  <Row key={it.k} it={it} d={d} terms={hasil.terms} kodePrefix={hasil.kodePrefix} />
                ))}
              </div>
              {tampil.length > batas && (
                <button type="button" className="btn ghost more" onClick={() => setBatas((b) => b + HALAMAN)}>
                  Tampilkan lebih banyak ({fmt(tampil.length - batas)} lagi)
                </button>
              )}
              <p className="hint">
                <Icon name="info" />
                Klik ikon salin untuk menyalin kode. Klik kelompok untuk melihat turunannya.
              </p>
            </>
          )}
        </>
      )}
    </>
  )
}
