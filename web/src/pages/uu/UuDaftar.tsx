import { Link } from 'react-router-dom'
import { useTitle } from '../../components/ui.tsx'
import { PdfLink } from '../../components/PdfLink.tsx'
import { useUu } from '../../stateUu.tsx'

/** Daftar isi: semua BAB dan pasalnya dalam satu halaman. */
export default function UuDaftar() {
  const d = useUu()
  useTitle('Daftar Isi · UU 43/2009')

  return (
    <>
      <div className="page-head">
        <h1>Daftar Isi</h1>
        <p>
          UU Nomor 43 Tahun 2009 tentang Kearsipan. Ketuk nomor pasal untuk membaca isinya.{' '}
          <PdfLink peraturan="uu-43-2009" halaman={d.halaman.penjelasan} className="link">
            Penjelasan umum (PDF hlm {d.halaman.penjelasan})
          </PdfLink>
        </p>
      </div>

      <div className="uu-daftar">
        {d.bab.map((b) => (
          <section key={b.id} className="card uu-bab" aria-labelledby={`bab-${b.id}`}>
            <h2 id={`bab-${b.id}`}>
              <Link to={`/uu-43-2009/bab/${b.id}`}>
                <span className="mono">BAB {b.id}</span> {b.n}
              </Link>
            </h2>
            <div className="uu-chips">
              {(d.byBab.get(b.id) ?? []).map((p) => (
                <Link key={p.p} to={`/uu-43-2009/pasal/${p.p}`} className="chip">
                  {p.p}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
