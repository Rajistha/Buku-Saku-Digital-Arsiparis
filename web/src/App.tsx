import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import { ToastProvider } from './components/ui.tsx'
import { DataProvider } from './state.tsx'
import About from './pages/About.tsx'
import Browse from './pages/Browse.tsx'
import Home from './pages/Home.tsx'
import Search from './pages/Search.tsx'

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
          </Routes>
        </DataProvider>
      </ToastProvider>
    </HashRouter>
  )
}
