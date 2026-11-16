// Splash awal ada di index.html (tampil sebelum JavaScript jalan). Ditutup setelah data siap,
// tetapi tidak lebih cepat dari lamanya animasi logo, supaya tidak berkedip.
const MINIMAL_PERTAMA = 1700 // pembukaan pertama pada sesi ini: animasi logo sampai selesai
const MINIMAL_LAIN = 400 // muat ulang dalam sesi yang sama: cukup singkat

let sudah = false

export function tutupSplash(): void {
  if (sudah) return
  sudah = true
  const el = document.getElementById('splash')
  if (!el) return
  let minimal = MINIMAL_PERTAMA
  try {
    if (sessionStorage.getItem('splash-sudah')) minimal = MINIMAL_LAIN
    sessionStorage.setItem('splash-sudah', '1')
  } catch {
    // penyimpanan sesi bisa diblokir; pakai durasi penuh
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) minimal = Math.min(minimal, MINIMAL_LAIN)
  // performance.now() dihitung sejak navigasi dimulai, jadi waktu muat data sudah ikut terhitung
  setTimeout(() => {
    el.classList.add('hilang')
    setTimeout(() => el.remove(), 500)
  }, Math.max(0, minimal - performance.now()))
}
