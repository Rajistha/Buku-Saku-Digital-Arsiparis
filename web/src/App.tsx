import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import BatasGalat from './components/BatasGalat.tsx'
import Layout from './components/Layout.tsx'
import { PdfSkeleton } from './components/Skeleton.tsx'
import { ToastProvider } from './components/ui.tsx'
import { cariPeraturan, PERATURAN_UTAMA } from './peraturan.ts'
import { DataProvider } from './state.tsx'
import { UuProvider } from './stateUu.tsx'
import About from './pages/About.tsx'
import Browse from './pages/Browse.tsx'
import Home from './pages/Home.tsx'
import Pilih from './pages/Pilih.tsx'
import Search from './pages/Search.tsx'
import UuBab from './pages/uu/UuBab.tsx'
import UuDaftar from './pages/uu/UuDaftar.tsx'
import UuHome from './pages/uu/UuHome.tsx'
import UuPasal from './pages/uu/UuPasal.tsx'
import UuSearch from './pages/uu/UuSearch.tsx'

// penampil PDF memuat pustaka besar (pdf.js), jadi hanya dimuat saat dibuka
const PdfViewer = lazy(() => import('./pages/PdfViewer.tsx'))

const PERGUB = PERATURAN_UTAMA
const UU = cariPeraturan('uu-43-2009')!

function PdfLama() {
  const { hlm } = useParams()
  const { search } = useLocation()
  return <Navigate to={`/pdf/${PERGUB.id}/${hlm}${search}`} replace />
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <Routes>
          <Route index element={<Pilih />} />

          {/* Pergub 64/2023: data klasifikasi dimuat hanya di sini */}
          <Route
            element={
              <DataProvider>
                <Layout peraturan={PERGUB} />
              </DataProvider>
            }
          >
            <Route path="beranda" element={<Home />} />
            <Route path="cari" element={<Search />} />
            <Route path="telusur" element={<Browse />} />
            <Route path="telusur/:kode" element={<Browse />} />
            <Route path="tentang" element={<About />} />
          </Route>

          {/* UU 43/2009 */}
          <Route
            path="uu-43-2009"
            element={
              <UuProvider>
                <Layout peraturan={UU} />
              </UuProvider>
            }
          >
            <Route index element={<UuHome />} />
            <Route path="cari" element={<UuSearch />} />
            <Route path="daftar" element={<UuDaftar />} />
            <Route path="bab/:id" element={<UuBab />} />
            <Route path="pasal/:no" element={<UuPasal />} />
            <Route path="*" element={<Navigate to="/uu-43-2009" replace />} />
          </Route>

          <Route
            path="pdf/:id/:hlm"
            element={
              <BatasGalat pesan="Penampil PDF gagal dimuat.">
                <Suspense fallback={<PdfSkeleton pesan="Memuat penampil PDF" />}>
                  <PdfViewer />
                </Suspense>
              </BatasGalat>
            }
          />
          {/* alamat lama /pdf/:hlm (sebelum ada banyak peraturan) tetap menuju Pergub 64/2023 */}
          <Route path="pdf/:hlm" element={<PdfLama />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </HashRouter>
  )
}
