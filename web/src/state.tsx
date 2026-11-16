import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { buildData, type Data, type Item } from './data.ts'

const DataCtx = createContext<Data | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let batal = false
    fetch('data/klasifikasi.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<Item[]>
      })
      .then((items) => {
        if (!batal) setData(buildData(items))
      })
      .catch((e: unknown) => {
        if (!batal) setErr(String(e))
      })
    return () => {
      batal = true
    }
  }, [])

  if (err)
    return (
      <div className="boot">
        <b>Data gagal dimuat ({err}).</b>
        <button className="btn primary" onClick={() => location.reload()}>
          Muat ulang
        </button>
      </div>
    )
  if (!data)
    return (
      <div className="boot" role="status">
        <div className="spin" />
        Memuat data klasifikasi…
      </div>
    )
  return <DataCtx.Provider value={data}>{children}</DataCtx.Provider>
}

export function useData(): Data {
  const d = useContext(DataCtx)
  if (!d) throw new Error('useData harus di dalam DataProvider')
  return d
}
