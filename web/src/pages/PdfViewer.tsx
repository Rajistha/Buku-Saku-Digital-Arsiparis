import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Icon } from '../components/Icon.tsx'
import { useTitle } from '../components/ui.tsx'
import { useOnline } from '../pwa.tsx'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const PDF = 'pergub-64-2023.pdf'

// Dokumen disimpan selama aplikasi terbuka: membuka penampil lagi (atau pindah ke kode lain)
// tidak mengunduh ulang. Untuk PDF ini pembukaan pertama ±7 MB karena satu bagian besar yang
// dipakai bersama oleh seluruh halaman, jadi pengunduhan ulang yang sia-sia perlu dihindari.
let dokumen: Promise<PDFDocumentProxy> | null = null
function muatDokumen(): Promise<PDFDocumentProxy> {
  if (!dokumen) {
    // disableAutoFetch hanya bekerja bila disableStream juga dinyalakan
    const tugas = pdfjs.getDocument({ url: new URL(PDF, document.baseURI).href, disableAutoFetch: true, disableStream: true })
    dokumen = tugas.promise.catch((e: unknown) => {
      dokumen = null // gagal: coba lagi bisa mengulang
      throw e
    })
  }
  return dokumen
}

/** Penampil PDF di dalam aplikasi, dengan tombol Kembali (aplikasi terpasang tidak punya bilah browser). */
export default function PdfViewer() {
  const { hlm } = useParams()
  const [params] = useSearchParams()
  const kode = params.get('k')
  const nav = useNavigate()
  const { key } = useLocation()
  const online = useOnline()

  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [status, setStatus] = useState<'memuat' | 'siap' | 'gagal'>('memuat')
  const [coba, setCoba] = useState(0)
  const [lebar, setLebar] = useState(0)
  const [menggambar, setMenggambar] = useState(false)
  const area = useRef<HTMLDivElement>(null)
  const halamanEl = useRef<HTMLDivElement>(null)
  const kanvas = useRef<HTMLCanvasElement>(null)

  const total = doc?.numPages ?? 0
  const diminta = Math.max(1, Math.floor(Number(hlm)) || 1)
  const halaman = total ? Math.min(diminta, total) : diminta
  const [ketik, setKetik] = useState(String(halaman))
  useTitle(`PDF hlm ${halaman}`)

  // buka dokumen (dipakai ulang bila sudah pernah dimuat)
  useEffect(() => {
    setDoc(null)
    setStatus('memuat')
    let batal = false
    muatDokumen()
      .then((d) => {
        if (batal) return
        setDoc(d)
        setStatus('siap')
      })
      .catch(() => {
        if (!batal) setStatus('gagal')
      })
    return () => {
      batal = true
    }
  }, [coba])

  // lebar tempat halaman, agar halaman selalu pas dengan layar
  useEffect(() => {
    const el = halamanEl.current
    if (!el) return
    const ro = new ResizeObserver(() => setLebar(Math.round(el.clientWidth)))
    ro.observe(el)
    setLebar(Math.round(el.clientWidth))
    return () => ro.disconnect()
  }, [])

  // gambar halaman ke kanvas
  useEffect(() => {
    if (!doc || !lebar) return
    let batal = false
    let tugas: RenderTask | null = null
    setMenggambar(true)
    ;(async () => {
      const page = await doc.getPage(halaman)
      const cv = kanvas.current
      if (batal || !cv) return
      const dasar = page.getViewport({ scale: 1 })
      // resolusi lebih tinggi agar tetap tajam saat layar dicubit/diperbesar
      const kualitas = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3)
      const vp = page.getViewport({ scale: (lebar / dasar.width) * kualitas })
      cv.width = Math.floor(vp.width)
      cv.height = Math.floor(vp.height)
      tugas = page.render({ canvas: cv, viewport: vp })
      await tugas.promise
      if (!batal) setMenggambar(false)
    })().catch((e: unknown) => {
      if (batal || (e as { name?: string } | null)?.name === 'RenderingCancelledException') return
      setStatus('gagal')
    })
    return () => {
      batal = true
      tugas?.cancel()
    }
  }, [doc, halaman, lebar])

  // kurung kurawal: nilai kembalian efek dianggap fungsi pembersih oleh React (scrollTo mengembalikan Promise)
  useEffect(() => {
    setKetik(String(halaman))
  }, [halaman])
  useEffect(() => {
    area.current?.scrollTo(0, 0)
  }, [halaman])

  const q = kode ? `?k=${encodeURIComponent(kode)}` : ''
  const ke = (n: number) => nav(`/pdf/${Math.min(Math.max(1, n), total || n)}${q}`, { replace: true })
  // replace: tombol Kembali membawa pengguna keluar dari penampil, bukan mundur halaman demi halaman
  const kembali = () => (key !== 'default' ? nav(-1) : nav(kode ? `/telusur/${kode}` : '/', { replace: true }))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return
      if (e.key === 'ArrowRight' && halaman < total) ke(halaman + 1)
      if (e.key === 'ArrowLeft' && halaman > 1) ke(halaman - 1)
      if (e.key === 'Escape') kembali()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const lompat = (e: FormEvent) => {
    e.preventDefault()
    const n = Math.floor(Number(ketik))
    if (n >= 1) ke(n)
    else setKetik(String(halaman))
  }

  return (
    <div className="pdfv">
      <header className="pdfv-bar">
        <button type="button" className="btn ghost sm" onClick={kembali}>
          <Icon name="chevl" />
          Kembali
        </button>
        <div className="pdfv-judul">
          <b>Pergub Bali 64/2023</b>
          {kode && <span className="mono">{kode}</span>}
        </div>
        <form className="pdfv-nav" onSubmit={lompat}>
          <button type="button" className="ikon" disabled={halaman <= 1} onClick={() => ke(halaman - 1)} aria-label="Halaman sebelumnya">
            <Icon name="chevl" />
          </button>
          <input
            value={ketik}
            onChange={(e) => setKetik(e.target.value.replace(/\D/g, ''))}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            aria-label="Nomor halaman"
          />
          <span>/ {total ? total.toLocaleString('id-ID') : '…'}</span>
          <button type="button" className="ikon" disabled={!total || halaman >= total} onClick={() => ke(halaman + 1)} aria-label="Halaman berikutnya">
            <Icon name="chev" />
          </button>
        </form>
      </header>

      <div className="pdfv-area" ref={area}>
        <div className="pdfv-halaman" ref={halamanEl}>
          {status === 'gagal' ? (
            <div className="pdfv-galat">
              <Icon name="wifiOff" />
              <b>PDF tidak bisa dimuat</b>
              <span>{online ? 'Terjadi kesalahan saat memuat halaman.' : 'PDF memerlukan koneksi internet.'}</span>
              <div className="kosong-act">
                <button type="button" className="btn primary" onClick={() => setCoba((c) => c + 1)}>
                  Coba lagi
                </button>
                <button type="button" className="btn ghost" onClick={kembali}>
                  Kembali
                </button>
              </div>
            </div>
          ) : (
            <>
              {(status === 'memuat' || menggambar) && (
                <div className="pdfv-muat" role="status">
                  <div className="spin" />
                  {doc ? `Memuat halaman ${halaman}…` : 'Memuat PDF… pertama kali bisa ±7 MB'}
                </div>
              )}
              <canvas ref={kanvas} className="pdfv-kanvas" aria-label={`Halaman ${halaman} Peraturan Gubernur Bali Nomor 64 Tahun 2023`} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
