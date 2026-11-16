import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import BatasGalat from './components/BatasGalat.tsx'
import Layout from './components/Layout.tsx'
import { ToastProvider } from './components/ui.tsx'
import { DataProvider } from './state.tsx'
import About from './pages/About.tsx'
import Browse from './pages/Browse.tsx'
import Home from './pages/Home.tsx'
import Search from './pages/Search.tsx'

// penampil PDF memuat pustaka besar (pdf.js), jadi hanya dimuat saat dibuka
const PdfViewer = lazy(() => import('./pages/PdfViewer.tsx'))

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <DataProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="cari" element={<Search />} />
              <Route path="telusur" element={<Browse />} />
              <Route path="telusur/:kode" element={<Browse />} />
              <Route path="tentang" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            <Route
              path="pdf/:hlm"
              element={
                <BatasGalat pesan="Penampil PDF gagal dimuat.">
                  <Suspense
                    fallback={
                      <div className="boot" role="status">
                        <div className="spin" />
                        Memuat penampil PDF…
                      </div>
                    }
                  >
                    <PdfViewer />
                  </Suspense>
                </BatasGalat>
              }
            />
          </Routes>
        </DataProvider>
      </ToastProvider>
    </HashRouter>
  )
}
