import { useSyncExternalStore } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Icon } from './components/Icon.tsx'

/* ---------- tawaran pasang aplikasi ----------
 * Event beforeinstallprompt bisa muncul sebelum React selesai dimuat,
 * jadi ditangkap di tingkat modul (berkas ini diimpor dari main.tsx). */
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let tawaran: InstallEvent | null = null
const pendengar = new Set<() => void>()
const kabari = () => pendengar.forEach((f) => f())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  tawaran = e as InstallEvent
  kabari()
})
window.addEventListener('appinstalled', () => {
  tawaran = null
  kabari()
})

const langgan = (f: () => void) => {
  pendengar.add(f)
  return () => pendengar.delete(f)
}

/** Fungsi untuk memasang aplikasi, atau null bila browser tidak menawarkan (sudah terpasang, iOS, dsb.). */
export function useInstall(): (() => Promise<void>) | null {
  const ev = useSyncExternalStore(langgan, () => tawaran)
  if (!ev) return null
  return async () => {
    await ev.prompt()
    await ev.userChoice
    tawaran = null
    kabari()
  }
}

export function InstallButton({ className = '' }: { className?: string }) {
  const pasang = useInstall()
  if (!pasang) return null
  return (
    <button type="button" className={`btn ghost ${className}`} onClick={pasang}>
      <Icon name="download" />
      Pasang aplikasi
    </button>
  )
}

/* ---------- status online ---------- */
const langganOnline = (f: () => void) => {
  window.addEventListener('online', f)
  window.addEventListener('offline', f)
  return () => {
    window.removeEventListener('online', f)
    window.removeEventListener('offline', f)
  }
}
export const useOnline = (): boolean => useSyncExternalStore(langganOnline, () => navigator.onLine)

/* ---------- pemberitahuan service worker ---------- */
export function PwaStatus() {
  const {
    needRefresh: [perluMuatUlang, setPerluMuatUlang],
    offlineReady: [siapOffline, setSiapOffline],
    updateServiceWorker,
  } = useRegisterSW()
  const online = useOnline()

  if (perluMuatUlang)
    return (
      <div className="pwa-bar" role="status">
        <span>Versi baru tersedia.</span>
        <button type="button" className="btn primary sm" onClick={() => updateServiceWorker(true)}>
          Muat ulang
        </button>
        <button type="button" className="tutup" onClick={() => setPerluMuatUlang(false)} aria-label="Nanti saja">
          <Icon name="x" />
        </button>
      </div>
    )
  if (siapOffline)
    return (
      <div className="pwa-bar" role="status">
        <span>Siap dipakai tanpa internet.</span>
        <button type="button" className="tutup" onClick={() => setSiapOffline(false)} aria-label="Tutup">
          <Icon name="x" />
        </button>
      </div>
    )
  if (!online)
    return (
      <div className="pwa-bar off" role="status">
        <span>Mode offline: cari dan telusur tetap bisa, PDF perlu internet.</span>
      </div>
    )
  return null
}
