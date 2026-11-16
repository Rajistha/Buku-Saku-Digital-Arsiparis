"""Ekstrak Lampiran I (Klasifikasi Arsip) Pergub Bali 64/2023 -> data/klasifikasi.csv

Pakai:  python scripts/extract_klasifikasi.py
Hasil:  data/klasifikasi.csv         kode, nama, uraian, parent, level, bidang, halaman, kode_pdf, koreksi
        data/laporan_ekstraksi.txt   ringkasan + temuan yang perlu diperiksa
"""
import csv
import re
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "PERGUB NOMOR 64 TAHUN 2023.pdf"
OUT = ROOT / "data"
OUT.mkdir(exist_ok=True)

HAL_AWAL, HAL_AKHIR = 11, 149  # Lampiran I

KODE = re.compile(r"^(\d{3}(?:\.\d+)*)\.?\s+(\S.*)$")
BUANG = re.compile(
    r"^(LAMPIRAN I|PERATURAN GUBERNUR|NOMOR 64|TENTANG|KLASIFIKASI ARSIP|KLASIFIKSI ARSIP|AKSES ARSIP|ARSIP PEMERINTAH|"
    r"Pj\. GUBERNUR|ttd|S\. M\. MAHENDRA|KLASIFIKASI KEAMANAN|JADWAL RETENSI|DAN JADWAL|PEMERINTAH DAERAH)",
    re.I,
)
BIDANG = {
    "000": "Umum", "100": "Pemerintahan", "200": "Politik", "300": "Keamanan dan Ketertiban",
    "400": "Kesejahteraan Rakyat", "500": "Perekonomian", "600": "Pekerjaan Umum dan Ketenagaan",
    "700": "Pengawasan", "800": "Kepegawaian", "900": "Keuangan",
}

# Salah ketik nomor kode di PDF sumber. Dasarnya: urutan saudara (loncat/ganda) dan posisi di halaman.
# (kode di PDF, awal nama, kode yang benar, alasan)
KOREKSI = [
    ("400.4.3.4", "Monitoring, evaluasi dan analisa kebijakan perlindungan perempuan", "400.2.3.4",
     "Berada di antara 400.2.3.3 dan 400.2.3.5 (bagian Perlindungan Perempuan)"),
    ("400.5.6.1", "Kepeloporan Pemuda", "400.5.6.2",
     "Kode 400.5.6.1 muncul dua kali; yang kedua melanjutkan 400.5.6.1 Kepemimpinan"),
    ("400.6.2.1", "Pelindungan", "400.6.2.2",
     "Kode 400.6.2.1 muncul dua kali; urutan 1, (2), 3, 4 kehilangan nomor 2"),
    ("400.14.2", "Penumpulan, pengolahan, dan penyajian informasi kelembagaan", "400.14.4",
     "Kode 400.14.2 muncul dua kali; baris ini induk dari 400.14.4.1-3 (Kliping koran dst.)"),
    ("500.12.6.3", "Aplikasi Layanan Publik", "500.12.6.5",
     "Kode 500.12.6.3 muncul dua kali; berada setelah 500.12.6.4"),
    ("600.2.12.2", "Pengembangan Materi", "600.2.15.2",
     "Berada setelah 600.2.15.1 (Penerapan Teknologi Konstruksi)"),
    ("600.2.12.3", "Pendayagunaan Material dan Peralatan Konstruksi", "600.2.15.3",
     "Berada setelah 600.2.15.2 (Penerapan Teknologi Konstruksi)"),
]

# Salah ketik pada nama (dibandingkan dengan Lampiran II). kode -> (salah, benar, alasan)
KOREKSI_NAMA = {
    "400.14.4": ("Penumpulan,", "Pengumpulan,", "Lampiran II hlm 301 menulis 'Pengumpulan'"),
}

# Baris yang tidak ada di Lampiran I tetapi ada di Lampiran II (Lampiran I tampak terlewat).
TAMBAHAN = [
    ("400.14.3.1", "Kliping koran", 301),
    ("400.14.3.2", "Brosur/Leaflet/poster/plakat", 301),
    ("400.14.3.3", "Pengumuman/pemberitaan", 301),
]

ANTARA = re.compile(r"\s*\(?\s*(?:antara lain|anatara lain|anta?ra lain)\b[:\s]", re.I)


def rapikan(teks: str) -> str:
    return re.sub(r"\s+", " ", teks).strip()


KECIL = {"dan", "di", "ke", "dari", "untuk", "atau", "yang", "pada", "dengan", "serta"}
SINGKATAN = {"DPRD", "SDM", "ASN", "UMKM", "KB", "IPTEK", "BUMN", "BUMD", "TNI", "POLRI", "PNBP", "APBD", "SAR", "HAKI", "PUPR", "NAPZA"}


def judul(teks: str) -> str:
    """HURUF KAPITAL -> Huruf Judul, singkatan tetap kapital."""
    out = []
    for i, w in enumerate(teks.split()):
        if w in SINGKATAN:
            out.append(w)
        elif i > 0 and w.lower() in KECIL:
            out.append(w.lower())
        elif w.startswith("("):
            out.append("(" + w[1:].capitalize())
        else:
            out.append(w.capitalize())
    return " ".join(out)


def kunci(kode: str):
    return tuple(int(s) for s in kode.split("."))


def baca_pdf():
    """Kembalikan daftar (kode, nama, halaman) sesuai urutan di PDF."""
    baris_data, terakhir, ada_bidang = [], None, set()
    with pdfplumber.open(PDF) as pdf:
        for hal in range(HAL_AWAL, HAL_AKHIR + 1):
            for baris in (pdf.pages[hal - 1].extract_text() or "").splitlines():
                baris = baris.strip()
                if not baris or BUANG.match(baris):
                    continue
                m = KODE.match(baris)
                if m:
                    kode, nama = m.group(1), rapikan(m.group(2))
                    if re.fullmatch(r"\d00", kode):  # judul bidang diulang di tiap halaman
                        if kode in ada_bidang:
                            terakhir = None
                            continue
                        ada_bidang.add(kode)
                    baris_data.append({"kode_pdf": kode, "nama": nama, "halaman": hal})
                    terakhir = baris_data[-1]
                elif terakhir:
                    terakhir["nama"] = rapikan(terakhir["nama"] + " " + baris)
    return baris_data


def main():
    mentah = baca_pdf()

    # terapkan koreksi
    tersisa = list(KOREKSI)
    for e in mentah:
        e["kode"], e["koreksi"] = e["kode_pdf"], ""
        for k in list(tersisa):
            if e["kode_pdf"] == k[0] and e["nama"].startswith(k[1]):
                e["kode"], e["koreksi"] = k[2], k[3]
                tersisa.remove(k)
                break

    for e in mentah:  # koreksi nama
        k = KOREKSI_NAMA.get(e["kode"])
        if k and e["nama"].startswith(k[0]):
            e["nama"] = k[1] + e["nama"][len(k[0]):]
            e["koreksi"] = (e["koreksi"] + "; " if e["koreksi"] else "") + "Nama: " + k[2]

    for kode, nama, hal in TAMBAHAN:
        if not any(e["kode"] == kode for e in mentah):
            mentah.append({"kode_pdf": kode, "kode": kode, "nama": nama, "halaman": hal,
                           "koreksi": f"Tidak ada di Lampiran I; ditambahkan dari Lampiran II hlm {hal}",
                           "tambahan": True})

    # sisa kode ganda setelah koreksi
    lihat, ganda = {}, []
    for e in mentah:
        if e["kode"] in lihat:
            ganda.append((e["kode"], lihat[e["kode"]]["nama"], e["nama"], e["halaman"]))
        else:
            lihat[e["kode"]] = e
    ada = set(lihat)

    hasil, tanpa_induk = [], []
    for e in mentah:
        kode = e["kode"]
        seg = kode.split(".")
        level = len(seg)
        parent = ".".join(seg[:-1]) if level > 1 else ""
        if parent and parent not in ada:
            tanpa_induk.append((kode, parent))
        nama, uraian = e["nama"], ""
        m = ANTARA.search(nama)
        if m:
            nama, uraian = nama[: m.start()].strip(" ,"), nama[m.start():].strip(" ()")
        if level == 1:
            nama = BIDANG[kode]
        elif level == 2 and nama.isupper():
            nama = judul(nama)
        hasil.append({
            "kode": kode, "nama": nama, "uraian": uraian, "parent": parent, "level": level,
            "bidang": kode[:3], "halaman": e["halaman"],
            "kode_pdf": e["kode_pdf"] if e["kode_pdf"] != kode else "", "koreksi": e["koreksi"],
        })
    hasil.sort(key=lambda r: kunci(r["kode"]))

    with open(OUT / "klasifikasi.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(hasil[0].keys()))
        w.writeheader()
        w.writerows(hasil)

    # JSON ringkas untuk aplikasi: k kode, n nama, u uraian, h halaman, p nomor asli di PDF, c catatan koreksi
    import json
    ringkas = []
    for r in hasil:
        d = {"k": r["kode"], "n": r["nama"], "u": r["uraian"], "h": int(r["halaman"])}
        if r["kode_pdf"]:
            d["p"] = r["kode_pdf"]
        if r["koreksi"]:
            d["c"] = r["koreksi"]
        ringkas.append(d)
    teks_json = json.dumps(ringkas, ensure_ascii=False, separators=(",", ":"))
    (OUT / "klasifikasi.json").write_text(teks_json, encoding="utf-8")
    web_data = ROOT / "web" / "public" / "data"
    if web_data.parent.exists():
        web_data.mkdir(exist_ok=True)
        (web_data / "klasifikasi.json").write_text(teks_json, encoding="utf-8")

    # loncatan nomor antar saudara (sisa yang memang ada di PDF)
    saudara = {}
    for r in hasil:
        if r["parent"]:
            saudara.setdefault(r["parent"], []).append(int(r["kode"].split(".")[-1]))
    loncat = [(p, n) for p, n in saudara.items() if n != list(range(1, len(n) + 1))]

    per_bidang = {}
    for r in hasil:
        per_bidang[r["bidang"]] = per_bidang.get(r["bidang"], 0) + 1
    lap = [f"Total baris: {len(hasil)}", "", "Per bidang:"]
    lap += [f"  {k} {BIDANG[k]}: {v}" for k, v in sorted(per_bidang.items())]
    lap += ["", f"Koreksi nomor kode yang diterapkan ({len(KOREKSI) - len(tersisa)} dari {len(KOREKSI)}):"]
    lap += [f"  {k[0]} -> {k[2]}  ({k[3]})" for k in KOREKSI if k not in tersisa]
    if tersisa:
        lap += ["", "KOREKSI TIDAK TERPAKAI (periksa):"] + [f"  {k[0]} {k[1][:40]}" for k in tersisa]
    lap += ["", "Koreksi nama:"] + [f"  {k}: {v[0]} -> {v[1]}" for k, v in KOREKSI_NAMA.items()]
    lap += ["", f"Baris tambahan dari Lampiran II ({len(TAMBAHAN)}):"] + [f"  {k} {n}" for k, n, _ in TAMBAHAN]
    lap += ["", f"Kode ganda tersisa ({len(ganda)}):"] + [f"  {k} hlm {h}: '{a[:40]}' vs '{b[:40]}'" for k, a, b, h in ganda]
    lap += ["", f"Induk tidak ditemukan ({len(tanpa_induk)}):"] + [f"  {k} (induk {p})" for k, p in tanpa_induk]
    lap += ["", f"Loncatan nomor antar saudara ({len(loncat)}), memang demikian di PDF:"]
    for p, n in loncat:
        hilang = sorted(set(range(1, max(n) + 1)) - set(n))
        lap.append(f"  {p}: tidak ada nomor {hilang}")
    (OUT / "laporan_ekstraksi.txt").write_text("\n".join(lap), encoding="utf-8")
    print("\n".join(lap))


if __name__ == "__main__":
    main()
