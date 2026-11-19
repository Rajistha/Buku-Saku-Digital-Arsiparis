/** Daftar peraturan yang bisa dipilih di halaman awal. `id` dipakai di alamat (/pdf/:id/:hlm), jadi jangan diubah setelah dipublikasikan. */
export type MenuItem = { to: string; label: string; pendek: string; icon: string; end: boolean }

export type Peraturan = {
  id: string
  /** nama pendek untuk kartu dan penampil PDF */
  judul: string
  /** isi singkat untuk kartu */
  tentang: string
  /** teks tombol pada kartu */
  aksi: string
  /** nama ikon di Icon.tsx */
  ikon: string
  /** berkas di folder public */
  berkas: string
  /** alamat beranda peraturan ini */
  beranda: string
  menu: MenuItem[]
  /** keterangan sumber di bilah samping, dan halaman PDF yang dibuka dari situ */
  sumber: { teks: string; halaman: number }
  /** teks yang ditampilkan di penampil PDF untuk rujukan `k` */
  labelRujukan: (k: string) => string
  /** tujuan tombol Kembali di penampil PDF bila tidak ada riwayat */
  kembaliKe: (k: string | null) => string
}

export const PERATURAN: Peraturan[] = [
  {
    id: 'pergub-64-2023',
    judul: 'Pergub Bali 64/2023',
    tentang: 'Klasifikasi arsip, keamanan dan akses, serta jadwal retensi. Bisa dicari dan ditelusuri.',
    aksi: 'Cari dan telusuri',
    ikon: 'tree',
    berkas: 'pergub-64-2023.pdf',
    beranda: '/beranda',
    menu: [
      { to: '/beranda', label: 'Beranda', pendek: 'Beranda', icon: 'home', end: true },
      { to: '/cari', label: 'Cari Kode', pendek: 'Cari', icon: 'search', end: false },
      { to: '/telusur', label: 'Telusur Klasifikasi', pendek: 'Telusur', icon: 'tree', end: false },
      { to: '/tentang', label: 'Tentang Data', pendek: 'Tentang', icon: 'info', end: false },
    ],
    sumber: { teks: 'Pergub Bali No. 64 Tahun 2023, Lampiran I–III (hlm 11–893).', halaman: 11 },
    labelRujukan: (k) => k,
    kembaliKe: (k) => (k ? `/telusur/${k}` : '/beranda'),
  },
  {
    id: 'uu-43-2009',
    judul: 'UU 43/2009 Kearsipan',
    tentang: 'Dasar hukum kearsipan nasional. Cari pasal, telusuri per BAB, baca penjelasannya.',
    aksi: 'Cari pasal dan telusuri',
    ikon: 'law',
    berkas: 'uu-43-2009.pdf',
    beranda: '/uu-43-2009',
    menu: [
      { to: '/uu-43-2009', label: 'Beranda', pendek: 'Beranda', icon: 'home', end: true },
      { to: '/uu-43-2009/cari', label: 'Cari Pasal', pendek: 'Cari', icon: 'search', end: false },
      { to: '/uu-43-2009/daftar', label: 'Daftar Isi', pendek: 'Daftar Isi', icon: 'tree', end: false },
    ],
    sumber: { teks: 'Undang-Undang Nomor 43 Tahun 2009 tentang Kearsipan, beserta Penjelasan (hlm 1–86).', halaman: 1 },
    labelRujukan: (k) => `Pasal ${k}`,
    kembaliKe: (k) => (k ? `/uu-43-2009/pasal/${k}` : '/uu-43-2009'),
  },
]

export const PERATURAN_UTAMA = PERATURAN[0]

export function cariPeraturan(id: string | undefined): Peraturan | undefined {
  return PERATURAN.find((p) => p.id === id)
}
