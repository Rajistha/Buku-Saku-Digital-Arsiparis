import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BidangIcon, Icon } from '../components/Icon.tsx'
import { CopyButton, pushRecent, useTitle } from '../components/ui.tsx'
import { PdfLink } from '../components/PdfLink.tsx'
import { AKSES, ancestors, hasChildren, KEAMANAN, nasibOf, parentOf, type Data, type Item } from '../data.ts'
import { useData } from '../state.tsx'

const JUDUL = ['Tingkat 1 · Bidang', 'Tingkat 2 · Sub-bidang', 'Tingkat 3', 'Tingkat 4']
type Kolom = { judul: string; items: Item[]; aktif?: string }

const PDF_OFFLINE = (
  <>
    <Icon name="wifiOff" />
    PDF perlu internet
  </>
)

/** "2 Tahun" + "3 Tahun" → "5 tahun"; null bila salah satunya bukan angka tahun polos. */
function totalTahun(ra?: string, ri?: string): string | null {
  const a = /^(\d+) Tahun$/.exec(ra ?? '')
  const i = /^(\d+) Tahun$/.exec(ri ?? '')
  return a && i ? `${Number(a[1]) + Number(i[1])} tahun` : null
}

function Keamanan({ it, d }: { it: Item; d: Data }) {
  const at = d.aturan.get(it.k)
  const kea = at?.s ? KEAMANAN[at.s] : null
  const kelompok = hasChildren(d, it.k)
  return (
    <div className="ur">
      <b>Keamanan dan akses</b>
      {kea && at ? (
        <>
          <dl className="kv2">
            <dt>Keamanan</dt>
            <dd>
              <span className={`tag s-${at.s}`}>{kea.nama}</span>
            </dd>
            {at.a && (
              <>
                <dt>Akses</dt>
                <dd>{AKSES[at.a]}</dd>
              </>
            )}
            {kea.hak && (
              <>
                <dt>Hak akses</dt>
                <dd>{kea.hak}</dd>
              </>
            )}
            <dt>Dasar</dt>
            <dd>{kea.dasar}</dd>
          </dl>
          {at.hs && (
            <PdfLink halaman={at.hs} kode={it.k} className="link-pdf" offline={PDF_OFFLINE}>
              Lampiran II · hlm {at.hs} PDF
            </PdfLink>
          )}
        </>
      ) : (
        <span className="muted">
          {kelompok ? 'Kelompok ini tidak punya klasifikasi sendiri. Lihat jenis arsip di bawahnya.' : 'Tidak tercantum pada Lampiran II untuk kode ini.'}
        </span>
      )}
    </div>
  )
}

function Retensi({ it, d }: { it: Item; d: Data }) {
  const at = d.aturan.get(it.k)
  const kelompok = hasChildren(d, it.k)
  const ada = !!at && !!(at.ra || at.ri || at.rk)
  const nasib = nasibOf(at?.rk)
  const total = totalTahun(at?.ra, at?.ri)
  return (
    <div className="ur">
      <b>Retensi arsip</b>
      {at && ada ? (
        <>
          <dl className="kv2">
            {at.ra && (
              <>
                <dt>Aktif</dt>
                <dd>{at.ra}</dd>
              </>
            )}
            {at.ri && (
              <>
                <dt>Inaktif</dt>
                <dd>{at.ri}</dd>
              </>
            )}
            {total && (
              <>
                <dt>Total</dt>
                <dd>{total}</dd>
              </>
            )}
            {at.rk && (
              <>
                <dt>Nasib akhir</dt>
                <dd>
                  <span className={`tag n-${nasib}`}>{at.rk}</span>
                </dd>
              </>
            )}
          </dl>
          {at.w && (
            <p className="catatan">
              Jadwal ini tertulis untuk kelompok{' '}
              <Link to={`/telusur/${at.w}`} className="link">
                {at.w}
              </Link>{' '}
              dan berlaku juga untuk kode ini.
            </p>
          )}
        </>
      ) : at?.q ? (
        <p className="catatan">Nilai retensi tidak terbaca dengan pasti dari PDF. Periksa langsung pada halaman Lampiran III.</p>
      ) : (
        <span className="muted">
          {kelompok ? 'Kelompok ini tidak punya jadwal retensi sendiri. Lihat jenis arsip di bawahnya.' : 'Tidak tercantum pada Lampiran III untuk kode ini.'}
        </span>
      )}
      {at?.hr && (
        <PdfLink halaman={at.hr} kode={it.k} className="link-pdf" offline={PDF_OFFLINE}>
          Lampiran III · hlm {at.hr} PDF
        </PdfLink>
      )}
    </div>
  )
}

function Detail({ it, d }: { it: Item; d: Data }) {
  const jalur = ancestors(d, it.k).slice(0, -1)
  const anak = d.children.get(it.k)?.length ?? 0
  return (
    <section className="card detail" aria-label={`Detail ${it.k}`}>
      <div>
        <div className="kode">
          {it.k}
          <CopyButton kode={it.k} />
        </div>
        <h2>{it.n}</h2>
        <dl className="kv">
          <dt>Jenis</dt>
          <dd>{anak ? `Kelompok · ${anak} turunan` : 'Jenis arsip'}</dd>
          <dt>Jalur</dt>
          <dd>
            {jalur.length
              ? jalur.map((a, i) => (
                  <span key={a.k}>
                    {i > 0 && ' › '}
                    <Link to={`/telusur/${a.k}`}>
                      {a.k} {a.n}
                    </Link>
                  </span>
                ))
              : 'Bidang'}
          </dd>
          <dt>Sumber</dt>
          <dd>Lampiran I · hlm {it.h} PDF</dd>
        </dl>
        <div className="acts">
          <CopyButton kode={it.k} className="btn primary">
            Salin kode
          </CopyButton>
          <PdfLink
            halaman={it.h}
            kode={it.k}
            className="btn ghost"
            offline={PDF_OFFLINE}
          >
            <Icon name="file" />
            Buka PDF hlm {it.h}
          </PdfLink>
        </div>
      </div>
      <div>
        <div className="ur">
          <b>Uraian “antara lain”</b>
          {it.u ? it.u.replace(/^antara lain:?\s*/i, '') : <span className="muted">Tidak ada uraian tambahan pada Pergub untuk kode ini.</span>}
        </div>
        <Keamanan it={it} d={d} />
        <Retensi it={it} d={d} />
        {it.c && (
          <div className="ur warn">
            <b>Dikoreksi dari PDF</b>
            {it.p ? (
              <>
                Di PDF tertulis <span className="mono">{it.p}</span>. {it.c}.
              </>
            ) : (
              <>{it.c}.</>
            )}{' '}
            <Link to="/tentang" className="link">
              Lihat semua koreksi
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Browse() {
  const d = useData()
  const nav = useNavigate()
  const { kode } = useParams()
  const [lompat, setLompat] = useState('')
  const wadah = useRef<HTMLDivElement>(null)

  const sel = kode ? d.byCode.get(kode) : undefined
  const selDaun = !!sel && !hasChildren(d, sel.k)
  const path = useMemo(() => (sel ? ancestors(d, sel.k) : []), [d, sel])

  useTitle(sel ? `${sel.k} ${sel.n}` : 'Telusur Klasifikasi')
  useEffect(() => {
    // hanya jenis arsip yang dicatat, bukan setiap kelompok yang dilewati saat menelusur
    if (sel && selDaun) pushRecent(sel.k)
  }, [sel, selDaun])

  const kolom = useMemo(() => {
    const cols: Kolom[] = [{ judul: JUDUL[0], items: d.roots, aktif: path[0]?.k }]
    path.forEach((node, i) => {
      const anak = d.children.get(node.k)
      if (anak) cols.push({ judul: JUDUL[Math.min(i + 1, 3)], items: anak, aktif: path[i + 1]?.k })
    })
    return cols
  }, [d, path])

  // gulirkan kolom hanya bila item terpilih tidak terlihat
  useEffect(() => {
    wadah.current?.querySelectorAll<HTMLElement>('.mc').forEach((mc) => {
      const a = mc.querySelector<HTMLElement>('[data-aktif="1"]')
      if (!a) return
      const atas = a.offsetTop
      const bawah = atas + a.offsetHeight
      if (atas < mc.scrollTop + 40 || bawah > mc.scrollTop + mc.clientHeight - 24) mc.scrollTop = Math.max(0, atas - mc.clientHeight / 3)
    })
  }, [kolom])

  const onLompat = (e: FormEvent) => {
    e.preventDefault()
    const v = lompat.trim()
    if (!v) return
    nav(d.byCode.has(v) ? `/telusur/${v}` : `/cari?q=${encodeURIComponent(v)}`)
    setLompat('')
  }

  const induk = sel ? parentOf(sel.k) : null

  return (
    <>
      <div className="topbar">
        <div className="page-head grow">
          <h1>Telusur Klasifikasi</h1>
          <nav className="crumb" aria-label="Jalur kode">
            {path.length ? (
              path.map((a, i) => (
                <span key={a.k} className="crumb-it">
                  {i > 0 && <Icon name="chev" />}
                  {i === path.length - 1 ? (
                    <span className="cur" aria-current="page">
                      {a.k} {a.n}
                    </span>
                  ) : (
                    <Link to={`/telusur/${a.k}`}>
                      {a.k} {a.n}
                    </Link>
                  )}
                </span>
              ))
            ) : (
              <span>Pilih bidang untuk mulai</span>
            )}
          </nav>
        </div>
        <form className="jump" onSubmit={onLompat} role="search">
          <Icon name="search" />
          <input value={lompat} onChange={(e) => setLompat(e.target.value)} placeholder="Lompat ke kode…" aria-label="Lompat ke kode" />
        </form>
      </div>

      {sel && (
        <Link to={induk ? `/telusur/${induk}` : '/telusur'} className="btn ghost up">
          <Icon name="up" />
          Naik satu tingkat
        </Link>
      )}

      {kode && !sel && (
        <p className="empty-note">
          Kode <span className="mono">{kode}</span> tidak ditemukan.{' '}
          <Link to="/telusur" className="link">
            Kembali ke daftar bidang
          </Link>
        </p>
      )}

      <div className="card miller" ref={wadah}>
        {Array.from({ length: 4 }, (_, i) => {
          const k = kolom[i]
          if (!k) {
            const pesan = selDaun ? (i === kolom.length ? 'Tidak ada turunan' : '') : 'Pilih di kolom sebelumnya'
            return (
              <div key={i} className="mc">
                <h3>{JUDUL[i]}</h3>
                {pesan && <p className="none">{pesan}</p>}
              </div>
            )
          }
          return (
            <div key={i} className={'mc' + (i === 0 ? ' b' : '') + (i === kolom.length - 1 ? ' last' : '')}>
              <h3>{k.judul}</h3>
              {k.items.map((it) => {
                const anak = d.children.get(it.k)?.length ?? 0
                const dipilih = sel?.k === it.k
                const dijalur = k.aktif === it.k
                return (
                  <Link
                    key={it.k}
                    to={`/telusur/${it.k}`}
                    className={'it' + (dipilih ? ' sel' : dijalur ? ' path' : '')}
                    data-aktif={dijalur ? '1' : undefined}
                    aria-current={dipilih ? 'true' : undefined}
                  >
                    {i === 0 && <BidangIcon kode={it.k} />}
                    <span className="t">
                      <span className="mono">{it.k}</span>
                      <span className="nm">{it.n}</span>
                    </span>
                    {anak > 0 && (
                      <span className="n" title={`${anak} turunan`}>
                        {anak}
                      </span>
                    )}
                    {anak > 0 && <Icon name="chev" />}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </div>

      {sel ? (
        <Detail it={sel} d={d} />
      ) : (
        <section className="card detail">
          <p className="none">Pilih bidang, lalu telusuri sampai jenis arsip. Detail kode terpilih tampil di sini.</p>
        </section>
      )}
    </>
  )
}
