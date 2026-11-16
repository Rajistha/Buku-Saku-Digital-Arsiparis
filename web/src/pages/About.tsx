import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTitle } from '../components/ui.tsx'
import { InstallButton } from '../pwa.tsx'
import { BIDANG_FUNGSI, fmt, levelOf } from '../data.ts'
import { useData } from '../state.tsx'

export default function About() {
  const d = useData()
  useTitle('Tentang Data')

  const koreksi = useMemo(() => d.items.filter((i) => i.c), [d])
  const subBidang = useMemo(() => d.items.filter((i) => levelOf(i.k) === 2).length, [d])

  return (
    <>
      <div className="page-head">
        <h1>Tentang Data</h1>
        <p>Dari mana data ini berasal dan bagaimana diperiksa.</p>
      </div>

      <div className="stats">
        <div className="card stat">
          <b>{fmt(d.items.length)}</b>
          <span>kode klasifikasi</span>
        </div>
        <div className="card stat">
          <b>{d.roots.length}</b>
          <span>bidang (000–900)</span>
        </div>
        <div className="card stat">
          <b>{subBidang}</b>
          <span>sub-bidang</span>
        </div>
        <div className="card stat">
          <b>{koreksi.length}</b>
          <span>baris dikoreksi / ditambahkan</span>
        </div>
      </div>

      <div className="disclaimer">
        <b>Bukan aplikasi resmi pemerintah.</b> Buku saku ini hanya memudahkan pencarian. Dasar hukumnya tetap Peraturan Gubernur Bali Nomor 64 Tahun 2023.
        Bila ada perbedaan, naskah resmi yang berlaku. Setiap kode menyertakan nomor halaman PDF agar mudah dicek.{' '}
        <a href="pergub-64-2023.pdf" target="_blank" rel="noreferrer" className="link">
          Buka PDF Pergub
        </a>
      </div>

      <section className="card prose">
        <h2>Sumber</h2>
        <p>
          Peraturan Gubernur Bali Nomor 64 Tahun 2023 tentang Klasifikasi Arsip, Klasifikasi Keamanan dan Akses Arsip Dinamis, dan Jadwal Retensi Arsip Pemerintah
          Daerah, <b>Lampiran I</b> (Klasifikasi Arsip Pemerintah Daerah), halaman 11–149 pada berkas PDF.
        </p>
        <h2>Cara data diperiksa</h2>
        <ul>
          <li>Teks diambil otomatis dari PDF, lalu disusun menjadi hierarki bidang → sub-bidang → tingkat 3 → tingkat 4.</li>
          <li>
            Istilah di aplikasi: <b>kelompok</b> adalah kode yang punya turunan, <b>jenis arsip</b> adalah kode tanpa turunan.
          </li>
          <li>Tidak ada kode ganda, dan setiap kode (selain bidang) memiliki induk.</li>
          <li>Kode dibandingkan dengan Lampiran II yang memuat kode yang sama.</li>
          <li>
            Dua loncatan nomor memang ada pada PDF dan tidak diubah: <span className="mono">500.2.2</span> tidak memiliki nomor 9, dan <span className="mono">500.5.7</span> tidak
            memiliki nomor 5.
          </li>
          <li>Sebanyak 20 jenis arsip yang tidak terbaca di Lampiran II belum diperiksa satu per satu. Datanya tetap diambil dari Lampiran I.</li>
        </ul>
      </section>

      <section className="card prose">
        <h2>Pasang di HP atau laptop</h2>
        <p>Buku saku ini bisa dipasang seperti aplikasi dan tetap bisa dipakai untuk mencari dan menelusur tanpa internet. Hanya PDF Pergub yang memerlukan internet.</p>
        <ul>
          <li>
            <b>Android / Chrome / Edge:</b> tekan tombol di bawah, atau buka menu browser lalu pilih <i>Instal aplikasi</i> atau <i>Tambahkan ke layar utama</i>.
          </li>
          <li>
            <b>iPhone / iPad (Safari):</b> tekan tombol <i>Bagikan</i>, lalu pilih <i>Tambahkan ke Layar Utama</i>.
          </li>
        </ul>
        <InstallButton className="pasang-tentang" />
      </section>

      <section className="card prose">
        <h2>Jumlah kode per bidang</h2>
        <div className="scroll-x">
          <table className="tbl">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Bidang</th>
                <th>Fungsi</th>
                <th className="num">Jumlah kode</th>
              </tr>
            </thead>
            <tbody>
              {d.roots.map((b) => (
                <tr key={b.k}>
                  <td className="mono">
                    <Link to={`/telusur/${b.k}`}>{b.k}</Link>
                  </td>
                  <td>{b.n}</td>
                  <td>{BIDANG_FUNGSI[b.k]}</td>
                  <td className="num">{fmt(d.countByBidang.get(b.k) ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card prose">
        <h2>Koreksi pada data ({koreksi.length} baris)</h2>
        <p>
          PDF sumber memiliki salah ketik pada nomor kode. Berikut baris yang dikoreksi atau ditambahkan. Dasarnya adalah urutan nomor saudara, letak baris pada halaman, dan
          perbandingan dengan Lampiran II. Nomor asli di PDF tetap ditampilkan.
        </p>
        <div className="scroll-x">
          <table className="tbl">
            <thead>
              <tr>
                <th>Di PDF</th>
                <th>Di aplikasi</th>
                <th>Nama</th>
                <th>Dasar</th>
              </tr>
            </thead>
            <tbody>
              {koreksi.map((i) => (
                <tr key={i.k}>
                  <td className="mono">{i.p ?? '(tidak ada)'}</td>
                  <td className="mono">
                    <Link to={`/telusur/${i.k}`}>{i.k}</Link>
                  </td>
                  <td>{i.n}</td>
                  <td>{i.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
