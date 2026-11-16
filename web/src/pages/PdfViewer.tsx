import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type PointerEvent as PE } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { Icon } from '../components/Icon.tsx'
import { useTitle } from '../components/ui.tsx'
import { useOnline } from '../pwa.tsx'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const PDF = 'pergub-64-2023.pdf'
const ZOOM_MIN = 1
// putaran halaman hanya dua posisi (0 = normal, 90 = diputar) dan diingat selama sesi, agar halaman landscape berikutnya tetap terputar
const KUNCI_PUTAR = 'pdf-putar'
function putaranAwal(): number {
  try {
    const n = Number(sessionStorage.getItem(KUNCI_PUTAR))
    return n === 90 ? 90 : 0
  } catch {
    return 0
  }
}
const ZOOM_MAX = 4
const LANGKAH = [1, 1.5, 2, 3, 4]
const batas = (z: number) => Math.min(Math.max(z, ZOOM_MIN), ZOOM_MAX)

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
  // zoom: `zoom` mengubah ukuran tampilan seketika, `zoomGambar` (tertunda) menentukan resolusi gambar
  const [zoom, setZoom] = useState(1)
  const [putar, setPutar] = useState(putaranAwal)
  const [miring, setMiring] = useState(false) // halaman aslinya landscape
  const [zoomGambar, setZoomGambar] = useState(1)
  const zoomRef = useRef(1)
  const geserTertunda = useRef<{ left: number; top: number } | null>(null)
  const jari = useRef(new Map<number, { x: number; y: number }>())
  const bungkus = useRef<HTMLDivElement>(null)
  // cubit: selama jari bergerak hanya CSS transform yang berubah (tanpa render ulang dan reflow), ukuran asli diterapkan saat jari diangkat
  const gestur = useRef({ jarak: 0, zoom: 1, cubit: false, hidup: false, x: 0, y: 0, t: 0, tapT: 0, k: 1, mx: 0, my: 0, mx0: 0, my0: 0, ox: 0, oy: 0, wl: 0, wt: 0 })

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
      const rotasi = (page.rotate + putar) % 360
      const dasar = page.getViewport({ scale: 1, rotation: rotasi })
      setMiring(page.getViewport({ scale: 1 }).width > page.getViewport({ scale: 1 }).height)
      // resolusi lebih tinggi agar tetap tajam saat layar dicubit/diperbesar
      const tampil = lebar * zoomGambar
      const kualitas = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3, Math.max(1, 4096 / tampil))
      const vp = page.getViewport({ scale: (tampil / dasar.width) * kualitas, rotation: rotasi })
      // gambar di kanvas tersembunyi lalu salin sekaligus: kanvas yang tampil tidak sempat kosong/berkedip saat resolusi berganti
      const tmp = document.createElement('canvas')
      tmp.width = Math.floor(vp.width)
      tmp.height = Math.floor(vp.height)
      tugas = page.render({ canvas: tmp, viewport: vp })
      await tugas.promise
      if (batal) return
      cv.width = tmp.width
      cv.height = tmp.height
      cv.getContext('2d')?.drawImage(tmp, 0, 0)
      setMenggambar(false)
    })().catch((e: unknown) => {
      if (batal || (e as { name?: string } | null)?.name === 'RenderingCancelledException') return
      setStatus('gagal')
    })
    return () => {
      batal = true
      tugas?.cancel()
    }
  }, [doc, halaman, lebar, zoomGambar, putar])

  // kurung kurawal: nilai kembalian efek dianggap fungsi pembersih oleh React (scrollTo mengembalikan Promise)
  useEffect(() => {
    setKetik(String(halaman))
  }, [halaman])
  useEffect(() => {
    area.current?.scrollTo(0, 0)
  }, [halaman])

  // pertahankan titik yang dicubit/diketuk tetap di tempatnya setelah ukuran berubah
  useLayoutEffect(() => {
    const g = geserTertunda.current
    if (g && area.current) {
      area.current.scrollLeft = g.left
      area.current.scrollTop = g.top
    }
    geserTertunda.current = null
    // ukuran asli sudah terpasang, jadi transform sementara dari gestur cubit dilepas pada frame yang sama
    const w = bungkus.current
    if (w) {
      w.style.transform = ''
      w.style.transformOrigin = ''
      w.style.willChange = ''
    }
  }, [zoom])
  // gambar ulang dengan resolusi baru setelah zoom berhenti berubah
  useEffect(() => {
    const t = setTimeout(() => setZoomGambar(zoom), 250)
    return () => clearTimeout(t)
  }, [zoom])

  const putarHalaman = () => {
    const baru = putar === 0 ? 90 : 0
    setPutar(baru)
    try {
      sessionStorage.setItem(KUNCI_PUTAR, String(baru))
    } catch {
      // penyimpanan sesi bisa diblokir; putaran tetap berlaku selama halaman terbuka
    }
    area.current?.scrollTo(0, 0)
  }
  // di layar potret, halaman landscape yang belum diputar diberi petunjuk pada tombol putar
  const sarankanPutar = miring && putar === 0 && typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches

  const q = kode ? `?k=${encodeURIComponent(kode)}` : ''
  const ke = (n: number) => nav(`/pdf/${Math.min(Math.max(1, n), total || n)}${q}`, { replace: true })
  // replace: tombol Kembali membawa pengguna keluar dari penampil, bukan mundur halaman demi halaman
  const kembali = () => (key !== 'default' ? nav(-1) : nav(kode ? `/telusur/${kode}` : '/', { replace: true }))

  /**
   * Terapkan zoom z dengan titik fokus (fx,fy; koordinat layar) yang tetap di tempatnya, atau pindah ke (nx,ny)
   * bila jari bergeser selagi mencubit. Tanpa titik = tengah area. `geo` = ukuran awal bila transform sedang berjalan.
   */
  const setZoomDi = (baru: number, fx?: number, fy?: number, nx?: number, ny?: number, geo?: { ox: number; oy: number; wl: number; wt: number }) => {
    const el = area.current
    const w = bungkus.current
    const z = batas(baru)
    if (!el || !w) return
    if (z === zoomRef.current) {
      w.style.transform = ''
      w.style.transformOrigin = ''
      w.style.willChange = ''
      return
    }
    const ar = el.getBoundingClientRect()
    const x0 = fx ?? ar.left + ar.width / 2
    const y0 = fy ?? ar.top + ar.height / 2
    let g = geo
    if (!g) {
      const wr = w.getBoundingClientRect()
      g = { ox: x0 - wr.left, oy: y0 - wr.top, wl: wr.left - ar.left + el.scrollLeft, wt: wr.top - ar.top + el.scrollTop }
    }
    const rasio = z / zoomRef.current
    // titik halaman di bawah fokus awal diletakkan di fokus akhir
    geserTertunda.current = { left: g.wl + g.ox * rasio - ((nx ?? x0) - ar.left), top: g.wt + g.oy * rasio - ((ny ?? y0) - ar.top) }
    zoomRef.current = z
    setZoom(z)
  }
  const langkahZoom = (arah: 1 | -1) => {
    const z = zoomRef.current
    const tujuan = arah > 0 ? LANGKAH.find((l) => l > z + 0.01) : [...LANGKAH].reverse().find((l) => l < z - 0.01)
    setZoomDi(tujuan ?? (arah > 0 ? ZOOM_MAX : ZOOM_MIN))
  }

  const jarakJari = () => {
    const [a, b] = [...jari.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }
  const tengahJari = () => {
    const [a, b] = [...jari.current.values()]
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  }
  const onDown = (e: PE) => {
    if (e.pointerType === 'mouse') return
    jari.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gestur.current
    if (jari.current.size === 2) {
      const el = area.current
      const w = bungkus.current
      g.cubit = true
      g.jarak = jarakJari()
      g.zoom = zoomRef.current
      g.k = 1
      if (el && w && !g.hidup) {
        const m = tengahJari()
        const wr = w.getBoundingClientRect()
        const ar = el.getBoundingClientRect()
        g.mx = g.mx0 = m.x
        g.my = g.my0 = m.y
        g.ox = m.x - wr.left
        g.oy = m.y - wr.top
        g.wl = wr.left - ar.left + el.scrollLeft
        g.wt = wr.top - ar.top + el.scrollTop
        w.style.transformOrigin = `${g.ox}px ${g.oy}px`
        w.style.willChange = 'transform'
        el.style.overflow = 'hidden' // cegah gulir bawaan browser bersaing dengan transform selama mencubit
        g.hidup = true
      }
    } else if (jari.current.size === 1) {
      g.cubit = false
      g.x = e.clientX
      g.y = e.clientY
      g.t = Date.now()
    }
  }
  const onMove = (e: PE) => {
    if (!jari.current.has(e.pointerId)) return
    jari.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gestur.current
    const w = bungkus.current
    if (jari.current.size === 2 && g.hidup && g.jarak > 0 && w) {
      const m = tengahJari()
      g.k = batas(g.zoom * (jarakJari() / g.jarak)) / g.zoom
      g.mx = m.x
      g.my = m.y
      w.style.transform = `translate(${m.x - g.mx0}px, ${m.y - g.my0}px) scale(${g.k})`
    }
  }
  /** jari diangkat: ukuran sebenarnya diterapkan sekali, dari transform sementara */
  const akhiriCubit = () => {
    const g = gestur.current
    g.hidup = false
    if (area.current) area.current.style.overflow = ''
    const z = g.zoom * g.k
    setZoomDi(Math.abs(z - 1) < 0.03 ? 1 : z, g.mx0, g.my0, g.mx, g.my, { ox: g.ox, oy: g.oy, wl: g.wl, wt: g.wt })
  }
  const onUp = (e: PE) => {
    if (!jari.current.delete(e.pointerId)) return
    const g = gestur.current
    if (g.cubit) {
      if (g.hidup) akhiriCubit()
      if (jari.current.size === 0) g.cubit = false
      return
    }
    if (e.type === 'pointercancel') return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    const dt = Date.now() - g.t
    if (zoomRef.current < 1.05 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 700) {
      // geser ke kiri = halaman berikutnya
      if (dx < 0 && halaman < total) ke(halaman + 1)
      if (dx > 0 && halaman > 1) ke(halaman - 1)
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 300) {
      const sekarang = Date.now()
      if (sekarang - g.tapT < 300) {
        g.tapT = 0
        setZoomDi(zoomRef.current > 1.05 ? 1 : 2.5, e.clientX, e.clientY)
      } else g.tapT = sekarang
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return
      if (e.key === '+' || e.key === '=') langkahZoom(1)
      if (e.key === '-') langkahZoom(-1)
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
            enterKeyHint="go"
            aria-label="Nomor halaman"
          />
          <span>/ {total ? total.toLocaleString('id-ID') : '…'}</span>
          {ketik !== String(halaman) && (
            // papan ketik angka di HP (terutama iPhone) tidak punya tombol Enter, jadi ada tombol Pergi
            <button type="submit" className="pergi">
              Pergi
            </button>
          )}
          <button type="button" className="ikon" disabled={!total || halaman >= total} onClick={() => ke(halaman + 1)} aria-label="Halaman berikutnya">
            <Icon name="chev" />
          </button>
        </form>
      </header>

      <div
        className={`pdfv-area${zoom > 1.05 ? ' zoom' : ''}`}
        ref={area}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
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
              {!doc && <div className="pdfv-kerangka skel" />}
              <div className="pdfv-zoom" ref={bungkus} style={{ width: `${zoom * 100}%`, display: doc ? undefined : 'none' }}>
                <canvas ref={kanvas} className="pdfv-kanvas" aria-label={`Halaman ${halaman} Peraturan Gubernur Bali Nomor 64 Tahun 2023`} />
              </div>
            </>
          )}
        </div>
      </div>

      {status !== 'gagal' && (
        <div className="pdfv-ctl" role="group" aria-label="Zoom dan halaman">
          <button type="button" disabled={halaman <= 1} onClick={() => ke(halaman - 1)} aria-label="Halaman sebelumnya">
            <Icon name="chevl" />
          </button>
          <button
            type="button"
            className={'putar' + (sarankanPutar ? ' sorot' : '')}
            onClick={putarHalaman}
            aria-label={putar ? 'Kembalikan halaman ke posisi semula' : 'Putar halaman agar lebih besar'}
            title={putar ? 'Posisi semula' : 'Putar halaman'}
          >
            <Icon name="rotate" />
          </button>
          <button type="button" disabled={zoom <= ZOOM_MIN} onClick={() => langkahZoom(-1)} aria-label="Perkecil">
            −
          </button>
          <button type="button" className="pct" disabled={zoom === 1} onClick={() => setZoomDi(1)} aria-label="Ukuran pas layar">
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" disabled={zoom >= ZOOM_MAX} onClick={() => langkahZoom(1)} aria-label="Perbesar">
            +
          </button>
          <button type="button" disabled={!total || halaman >= total} onClick={() => ke(halaman + 1)} aria-label="Halaman berikutnya">
            <Icon name="chev" />
          </button>
        </div>
      )}
    </div>
  )
}
