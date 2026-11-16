import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AppSkeleton } from './components/Skeleton.tsx'
import { tutupSplash } from './splash.ts'
import { buildData, type Aturan, type Data, type Item } from './data.ts'

const DataCtx = createContext<Data | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let batal = false
    const ambil = <T,>(url: string) =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`)
        return r.json() as Promise<T>
      })
    Promise.all([ambil<Item[]>('data/klasifikasi.json'), ambil<Record<string, Aturan>>('data/aturan.json')])
      .then(([items, aturan]) => {
        if (!batal) setData(buildData(items, aturan))
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
        <b>Data gagal dimuat ({err}).</b>
        <button className="btn primary" onClick={() => location.reload()}>
          Muat ulang
        </button>
      </div>
    )
  if (!data) return <AppSkeleton />
  return <DataCtx.Provider value={data}>{children}</DataCtx.Provider>
}

export function useData(): Data {
  const d = useContext(DataCtx)
  if (!d) throw new Error('useData harus di dalam DataProvider')
  return d
}
