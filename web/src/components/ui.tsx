import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon.tsx'

/* ---------- toast ---------- */
const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('')
  const timer = useRef(0)
  const show = useCallback((m: string) => {
    setMsg(m)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMsg(''), 1800)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={'toast' + (msg ? ' on' : '')} role="status" aria-live="polite">
        {msg}
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- salin ---------- */
export async function salin(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

export function CopyButton({ kode, className = '', children }: { kode: string; className?: string; children?: ReactNode }) {
  const toast = useToast()
  return (
    <button
      type="button"
      className={className}
      aria-label={`Salin kode ${kode}`}
      title="Salin kode"
      onClick={async (e) => {
        e.stopPropagation()
        toast((await salin(kode)) ? `Disalin: ${kode}` : 'Gagal menyalin')
      }}
    >
      <Icon name="copy" />
      {children}
    </button>
  )
}

/* ---------- sorot kata ---------- */
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  // frasa utuh didahulukan agar "perjalanan dinas" tersorot sebagai satu blok
  const dasar = terms.filter(Boolean)
  const t = dasar.length > 1 ? [dasar.join(' '), ...dasar] : dasar
  if (!t.length) return <>{text}</>
  const parts = text.split(new RegExp(`(?<![A-Za-z0-9])(${t.map(esc).join('|')})`, 'gi'))
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p))}
    </>
  )
}

/* ---------- judul tab ---------- */
export function useTitle(judul: string): void {
  useEffect(() => {
    document.title = judul ? `${judul} · Buku Saku Digital Pemprov Bali` : 'Buku Saku Digital Pemprov Bali'
  }, [judul])
}

/* ---------- terakhir dilihat (disimpan di perangkat) ---------- */
const KEY = 'bsd.recent'

export function getRecent(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function pushRecent(k: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([k, ...getRecent().filter((x) => x !== k)].slice(0, 8)))
  } catch {
    /* penyimpanan tidak tersedia: abaikan */
  }
}
