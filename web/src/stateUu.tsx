import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AppSkeleton } from './components/Skeleton.tsx'
import { tutupSplash } from './splash.ts'
import { buildUu, type BerkasUu, type UuData } from './uu.ts'

const Ctx = createContext<UuData | null>(null)
// data disimpan selama aplikasi terbuka, jadi pindah halaman tidak memuat ulang
let simpanan: UuData | null = null

export function UuProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UuData | null>(simpanan)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (simpanan) return
    let batal = false
    fetch('data/uu-43-2009.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<BerkasUu>
      })
      .then((b) => {
        simpanan = buildUu(b)
        if (!batal) setData(simpanan)
      })
      .catch((e: unknown) => {
        if (!batal) setErr(String(e))
      })
    return () => {
      batal = true
    }
  }, [])

  // splash di index.html ditutup begitu data siap, atau bila gagal agar pesan galat terlihat
  useEffect(() => {
    if (data || err) tutupSplash()
  }, [data, err])

  if (err)
    return (
      <div className="boot">
        <b>Data UU gagal dimuat ({err}).</b>
        <button className="btn primary" onClick={() => location.reload()}>
          Muat ulang
        </button>
      </div>
    )
  if (!data) return <AppSkeleton />
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>
}

export function useUu(): UuData {
  const d = useContext(Ctx)
  if (!d) throw new Error('useUu harus di dalam UuProvider')
  return d
}
