import { Fragment } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon.tsx'
import { useTitle } from '../../components/ui.tsx'
import { PdfLink } from '../../components/PdfLink.tsx'
import { useUu } from '../../stateUu.tsx'
import { cuplikUu, type Pasal } from '../../uu.ts'

function Baris({ p }: { p: Pasal }) {
  return (
    <div className="r">
      <Link to={`/uu-43-2009/pasal/${p.p}`} className="r-main">
        <span className="kode mono">Pasal {p.p}</span>
        <div className="r-t">
          <b className="uu-cuplik">{cuplikUu(p, [])}</b>
        </div>
        <span className="pg">hlm {p.h}</span>
      </Link>
      <Link to={`/uu-43-2009/pasal/${p.p}`} className="act" tabIndex={-1} aria-hidden="true">
        <Icon name="chev" />
      </Link>
    </div>
  )
}

/** Satu BAB: pasal-pasalnya dikelompokkan menurut bagian dan paragraf. */
export default function UuBab() {
  const d = useUu()
  const { id } = useParams()
  const bab = d.babById.get(id ?? '')
  useTitle(bab ? `BAB ${bab.id} ${bab.n} · UU 43/2009` : '')
  if (!bab) return <Navigate to="/uu-43-2009" replace />

  const pasal = d.byBab.get(bab.id) ?? []
  const idx = d.bab.findIndex((b) => b.id === bab.id)
  const sebelum = d.bab[idx - 1]
  const sesudah = d.bab[idx + 1]

  return (
    <>
      <div className="page-head">
        <nav className="crumb" aria-label="Posisi">
          <Link to="/uu-43-2009">UU 43/2009</Link>
          <Icon name="chev" />
          <span className="cur">BAB {bab.id}</span>
        </nav>
        <h1>
          BAB {bab.id}: {bab.n}
        </h1>
        <p>
          {pasal.length} pasal · hlm {bab.h} di PDF ·{' '}
          <PdfLink peraturan="uu-43-2009" halaman={bab.h} className="link">
            Buka PDF
          </PdfLink>
        </p>
      </div>

      <div className="res">
        {pasal.map((p, i) => (
          <Fragment key={p.p}>
            {(i === 0 || p.bg !== pasal[i - 1].bg) && p.bg && <h3 className="uu-bagian">{p.bg}</h3>}
            <Baris p={p} />
          </Fragment>
        ))}
      </div>

      <div className="uu-sebelah">
        {sebelum ? (
          <Link to={`/uu-43-2009/bab/${sebelum.id}`} className="btn ghost">
            <Icon name="chevl" />
            BAB {sebelum.id}
          </Link>
        ) : (
          <span />
        )}
        {sesudah && (
          <Link to={`/uu-43-2009/bab/${sesudah.id}`} className="btn ghost">
            BAB {sesudah.id}
            <Icon name="chev" />
          </Link>
        )}
      </div>
    </>
  )
}
