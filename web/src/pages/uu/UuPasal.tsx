import { Link, Navigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon.tsx'
import { PdfLink } from '../../components/PdfLink.tsx'
import { salin, useTitle, useToast } from '../../components/ui.tsx'
import { useUu } from '../../stateUu.tsx'

/** huruf awal butir menentukan lekuk: "(1)" ayat, "a." huruf, "1." angka */
function kelasButir(t: string): string {
  if (/^\(\d+\)\s/.test(t)) return 'ayat'
  if (/^[a-z]\.\s/.test(t)) return 'huruf'
  if (/^\d+\.\s/.test(t)) return 'angka'
  return 'badan'
}

export default function UuPasal() {
  const d = useUu()
  const toast = useToast()
  const { no } = useParams()
  const p = d.byNo.get(no ?? '')
  useTitle(p ? `Pasal ${p.p} · UU 43/2009` : '')
  if (!p) return <Navigate to="/uu-43-2009/cari" replace />

  const bab = d.babById.get(p.b)
  const n = Number(p.p)
  const sebelum = d.byNo.get(String(n - 1))
  const sesudah = d.byNo.get(String(n + 1))
  const teksSalin = `Pasal ${p.p}\n${p.t.join('\n')}\n(UU Nomor 43 Tahun 2009 tentang Kearsipan)`

  return (
    <>
      <div className="page-head">
        <nav className="crumb" aria-label="Posisi">
          <Link to="/uu-43-2009">UU 43/2009</Link>
          <Icon name="chev" />
          <Link to={`/uu-43-2009/bab/${p.b}`}>BAB {p.b}</Link>
          <Icon name="chev" />
          <span className="cur">Pasal {p.p}</span>
        </nav>
        <h1>Pasal {p.p}</h1>
        <p>
          {bab ? `BAB ${bab.id}: ${bab.n}` : ''}
          {p.bg ? ` · ${p.bg}` : ''}
        </p>
      </div>

      <article className="card uu-pasal">
        <div className="uu-alat">
          <PdfLink peraturan="uu-43-2009" halaman={p.h} kode={p.p} className="btn ghost sm">
            <Icon name="file" />
            Buka PDF hlm {p.h}
          </PdfLink>
          <button
            type="button"
            className="btn ghost sm"
            onClick={async () => toast((await salin(teksSalin)) ? `Disalin: Pasal ${p.p}` : 'Gagal menyalin')}
          >
            <Icon name="copy" />
            Salin pasal
          </button>
        </div>
        <div className="uu-teks">
          {p.t.map((t, i) => (
            <p key={i} className={kelasButir(t)}>
              {t}
            </p>
          ))}
        </div>
      </article>

      <section className="card uu-pasal" aria-labelledby="h-pj">
        <h2 id="h-pj" className="uu-pj-h">
          Penjelasan
        </h2>
        {p.pj.length ? (
          <div className="uu-teks">
            {p.pj.map((t, i) => (
              <p key={i} className="badan">
                {t}
              </p>
            ))}
            <p className="uu-sumber">
              Dari bagian Penjelasan UU, hlm {d.halaman.penjelasan}–{d.halaman.akhir} di PDF.
            </p>
          </div>
        ) : (
          <p className="muted">Cukup jelas.</p>
        )}
      </section>

      <div className="uu-sebelah">
        {sebelum ? (
          <Link to={`/uu-43-2009/pasal/${sebelum.p}`} className="btn ghost">
            <Icon name="chevl" />
            Pasal {sebelum.p}
          </Link>
        ) : (
          <span />
        )}
        {sesudah && (
          <Link to={`/uu-43-2009/pasal/${sesudah.p}`} className="btn ghost">
            Pasal {sesudah.p}
            <Icon name="chev" />
          </Link>
        )}
      </div>
    </>
  )
}
