# PRD — Buku Saku Digital Pemprov Bali

| | |
|---|---|
| **Produk** | **Buku Saku Digital Pemprov Bali**: pencarian kode dan nama klasifikasi arsip Pemerintah Daerah |
| **Sumber data** | Peraturan Gubernur Bali No. 64 Tahun 2023, **Lampiran I** (hlm 11–149 PDF) |
| **Versi dokumen** | 0.2 (disederhanakan) |
| **Tanggal** | 16 November 2026 |
| **Dokumen terkait** | [ERD.md](ERD.md) · [DESIGN.md](DESIGN.md) · [ui/](ui/) · [../data/](../data/) |

> **Perubahan dari v0.1:** cakupan dipersempit menjadi **kode dan nama klasifikasi saja**, tetapi datanya **lengkap** (seluruh bidang 000–900). Fitur keamanan/akses (Lampiran II), jadwal retensi (Lampiran III), kalkulator, login, admin, dan Supabase **dikeluarkan** dari versi pertama.

---

## 1. Ringkasan

Pergub Bali No. 64/2023 memuat daftar kode klasifikasi arsip di PDF setebal 893 halaman. Mencari satu kode di dalamnya lambat. **Buku Saku Digital Pemprov Bali** menyajikan daftar itu sebagai web yang bisa dicari: ketik kata atau awalan kode, lalu langsung dapat kode dan nama klasifikasinya.

## 2. Masalah

| Masalah | Dampak |
|---|---|
| Kode klasifikasi tersebar di 139 halaman PDF (hlm 11–149) | Mencari satu kode harus menggulir dan membaca manual |
| Tidak bisa dicari dari HP dengan nyaman | Menomori surat atau memberkas arsip jadi lambat |
| Kode berjenjang sampai 4 tingkat (`000.5.6.2`) | Sulit mengetahui induk dan kelompoknya |

## 3. Tujuan & non-tujuan

**Tujuan**
1. Menemukan kode atau nama klasifikasi dalam **≤ 10 detik**.
2. Menyajikan **seluruh 2.989 kode** secara lengkap dan akurat, lengkap dengan halaman sumbernya.
3. Memudahkan menelusuri hierarki (bidang → sub-bidang → jenis arsip).
4. Bisa dipakai nyaman di HP dan laptop.

**Non-tujuan (di luar versi pertama)**
- Klasifikasi keamanan dan akses arsip (Lampiran II).
- Jadwal retensi arsip (Lampiran III) dan kalkulatornya.
- Login, akun pengguna, favorit tersinkron, dan panel admin.
- Pengelolaan dokumen arsip atau penomoran surat otomatis.

## 4. Pengguna

| Pengguna | Kebutuhan |
|---|---|
| Arsiparis / petugas arsip | Memastikan kode yang tepat saat memberkas dan menata arsip |
| Pegawai / TU | Mengetahui kode klasifikasi untuk nomor surat |

Tidak ada login. Siapa pun yang memiliki tautan dapat membuka.

## 5. Data

Seluruh data sudah diekstrak dari PDF dan disimpan di folder [`data/`](../data/).

| Item | Nilai |
|---|---|
| Total kode | **2.989** |
| Bidang (level 1) | 10 |
| Sub-bidang (level 2) | 56 |
| Level 3 / level 4 | 672 / 2.251 + 3 tambahan |
| Kode yang punya turunan (judul kelompok) | 548 |
| Kode jenis arsip (tanpa turunan) | 2.441 |
| Baris dengan uraian "antara lain" | 100 |
| Baris yang dikoreksi / ditambahkan | **10** (rincian di [ERD.md](ERD.md#6-koreksi-data)) |

Jumlah kode per bidang: 000 Umum 235 · 100 Pemerintahan 75 · 200 Politik 88 · 300 Keamanan dan Ketertiban 41 · 400 Kesejahteraan Rakyat 736 · 500 Perekonomian 1.306 · 600 Pekerjaan Umum dan Ketenagaan 285 · 700 Pengawasan 18 · 800 Kepegawaian 120 · 900 Keuangan 85.

**Kualitas data.** Hasil ekstraksi diperiksa dengan:
- Tidak ada kode ganda dan tidak ada induk yang hilang.
- Pemeriksaan silang dengan Lampiran II, yang memuat kode yang sama. Lampiran II memiliki 2.915 kode. Dari 74 kode yang hanya ada di Lampiran I, 54 adalah judul kelompok dan 20 adalah jenis arsip yang tidak terbaca di Lampiran II (kemungkinan tidak dicetak atau terpecah antarbaris). Ke-20 baris itu **belum diperiksa satu per satu**. Sebaliknya, 3 kode yang hanya ada di Lampiran II sudah ditambahkan.
- Dua loncatan nomor ada di PDF aslinya (`500.2.2` tidak punya nomor 9, `500.5.7` tidak punya nomor 5) dan tidak diubah.

## 6. Fitur (versi pertama)

| # | Fitur | Keterangan | Prioritas |
|---|---|---|---|
| F1 | **Cari** | Satu kotak cari untuk kode (awalan) atau kata dari nama dan uraian. Toleran salah ketik ringan. Hasil ditandai (highlight) | P0 |
| F2 | **Telusur hierarki** | Buka per bidang → sub-bidang → jenis arsip dalam kolom bertingkat | P0 |
| F3 | **Detail kode** | Kode, nama, uraian "antara lain", jalur induk, kode setingkat, dan halaman sumber di PDF | P0 |
| F4 | **Salin kode** | Satu klik menyalin kode | P0 |
| F5 | **Terakhir dilihat** | Disimpan di perangkat pengguna (tanpa akun) | P1 |
| F6 | **Tentang data** | Sumber, cara data diperiksa, dan daftar koreksi | P1 |
| F7 | **Offline (PWA)** | Bisa dipasang di HP dan dibuka tanpa internet | P2 (belum dikerjakan) |

### Kriteria penerimaan
- **F1:** mengetik `000.1.2` menampilkan 000.1.2 beserta seluruh turunannya. Mengetik `perjalanan dinas` menampilkan 8 hasil (2 kelompok, 6 jenis arsip). Kata hanya cocok di awal kata (`anggaran` tidak menarik `pelanggaran`). Salah ketik ringan (`perjalnan dinas`) diperbaiki otomatis dan diberi tahu. Respons < 100 ms.
- **F2:** klik bidang membuka sub-bidangnya, dan seterusnya sampai tingkat terakhir. Jalur induk selalu terlihat.
- **F3:** setiap kode menampilkan halaman PDF sumbernya. Kode yang dikoreksi menampilkan catatan koreksi.
- **Data:** jumlah kode di aplikasi sama dengan `data/klasifikasi.csv` (2.989).

## 7. Kebutuhan non-fungsional

| Aspek | Target |
|---|---|
| Ukuran data | 237 KB (JSON), dimuat sekali |
| Performa | Muat awal < 2 dtk di 4G, pencarian di browser tanpa server |
| Responsif | 360 px sampai 1440 px+ |
| Aksesibilitas | Kontras teks ≥ 4.5:1, bisa dioperasikan dengan keyboard |
| Bahasa | Indonesia |
| Biaya | Gratis (hosting statis) |

## 8. Tech stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Ekstraksi data | Python 3 + pdfplumber | Sudah selesai: [`scripts/extract_klasifikasi.py`](../scripts/extract_klasifikasi.py) |
| Frontend | Vite + React + TypeScript | Komponen untuk kartu, pohon, dan hasil cari |
| Styling | CSS biasa (tanpa Tailwind) | Gaya mockup dipindahkan apa adanya; tanpa pustaka tambahan |
| Pencarian | Buatan sendiri (tanpa pustaka) | Data hanya 2.989 baris, jadi pemindaian langsung cukup cepat. Mencocokkan awal kata dan memperbaiki salah ketik |
| Data | `klasifikasi.json` statis | Tanpa database dan tanpa backend |
| Offline | vite-plugin-pwa | Dipakai bila F7 dikerjakan |
| Hosting | Netlify / Vercel / GitHub Pages | Gratis |

**Tidak memakai Supabase.** Data tidak berubah kecuali Pergub direvisi, jadi cukup file statis. Bila nanti dibutuhkan login atau favorit tersinkron, Supabase bisa ditambahkan tanpa mengubah struktur data.

## 9. Risiko

| Risiko | Mitigasi |
|---|---|
| Salah ketik di PDF sumber memengaruhi kode | 7 nomor kode dan 1 nama dikoreksi dengan dasar yang tercatat; nomor asli tetap disimpan; sebagian dikonfirmasi lewat Lampiran II |
| Ekstraksi melewatkan baris | Pemeriksaan silang dengan Lampiran II (lihat bagian 5) |
| Pergub direvisi | Jalankan ulang skrip ekstraksi pada PDF baru |
| Data keliru tidak terdeteksi | Setiap kode menampilkan halaman PDF untuk diperiksa langsung |

## 10. Milestone

| # | Milestone | Status |
|---|---|---|
| M0 | Ekstraksi dan pemeriksaan data Lampiran I | ✅ Selesai |
| M1 | Dokumen (PRD, ERD, DESIGN) dan mockup UI | ✅ Selesai |
| M2 | Aplikasi: cari, telusur, detail, salin | ✅ Selesai |
| M3 | Terakhir dilihat, Tentang data, tampilan mobile | ✅ Selesai |
| M4 | PWA offline, uji, dan rilis | Sebagian: 15 uji otomatis lulus; PWA offline dan rilis belum |

## 11. Pertanyaan terbuka

1. Perlukah klasifikasi keamanan (Lampiran II) dan retensi (Lampiran III) ditambahkan di rilis berikutnya?
2. Logo dan identitas visual: memakai logo Pemprov Bali (perlu izin) atau netral?
3. Perlu halaman untuk melaporkan data yang salah?
