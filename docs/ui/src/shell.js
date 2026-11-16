// Ikon garis sederhana (gaya Lucide) + sidebar bersama untuk semua mockup.
const P = {
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  tree: '<path d="M3 5h6M3 12h6M3 19h6"/><path d="M13 5h8M15 12h6M15 19h6"/><path d="M9 5h2v14H9M11 12h2M11 19h2"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  scale: '<path d="M12 3v18M5 21h14M3 7h18"/><path d="m6 7-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  chevd: '<path d="m6 9 6 6 6-6"/>',
  chevl: '<path d="m15 18-6-6 6-6"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9L10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  lock: '<rect x="4" y="11" width="16" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  note: '<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4M8 9h8M8 13h5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  box: '<path d="M21 8v13H3V8"/><rect x="1" y="3" width="22" height="5" rx="1"/><path d="M10 12h4"/>',
  // ikon bidang
  b000: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h8"/>',
  b100: '<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M12 3 2 9h20z"/>',
  b200: '<path d="M4 4h16v12H5.2L4 17.2z"/><path d="M8 9h8M8 12h5"/>',
  b300: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  b400: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>',
  b500: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  b600: '<path d="M2 20h20M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>',
  b700: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11l2 2 4-4"/>',
  b800: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M22 11h-6"/>',
  b900: '<rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="12" cy="12.5" r="2.5"/><path d="M6 10h.01M18 15h.01"/>',
};
function icon(n, cls = '') { return `<svg class="ic ${cls}" viewBox="0 0 24 24">${P[n] || ''}</svg>`; }

function sidebar(active) {
  const items = [
    ['beranda', 'home', 'Beranda'], ['cari', 'search', 'Cari Kode'], ['telusur', 'tree', 'Telusur Klasifikasi'],
    ['tentang', 'info', 'Tentang Data'],
  ];
  const a = ([k, i, l]) => `<a class="${k === active ? 'active' : ''}">${icon(i)}${l}</a>`;
  return `<div class="logo"><div class="mark2"><svg viewBox="0 0 64 64" width="38" height="38"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7283F5"/><stop offset="1" stop-color="#3E4FD3"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#lg)"/><path d="M17 14a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v30H17z" fill="#fff"/><path d="M17 14a4 4 0 0 1 4-4h1.6v34H17z" fill="#D9DFFF"/><path d="M41 10h5v13.5l-2.5-2.3L41 23.5z" fill="#FFC861"/><path d="M34 20.5 28.6 30.6M34 20.5 38.8 30.6" stroke="#5468E7" stroke-width="1.8" stroke-linecap="round" fill="none"/><g fill="#5468E7"><circle cx="34" cy="19.6" r="2.6"/><circle cx="28.6" cy="30.6" r="2.3"/><circle cx="38.8" cy="30.6" r="2.3"/></g><path d="M12.5 38h39v9.2L32 56 12.5 47.2z" fill="#2B37A8" stroke="#2B37A8" stroke-width="2" stroke-linejoin="round"/><path d="M17 42h30v3.6L32 51.6 17 45.6z" fill="none" stroke="#8FA0FF" stroke-width="1.3" stroke-linejoin="round" stroke-dasharray="2.6 2.2"/></svg></div><div><b>Buku Saku Digital</b><small>Pemprov Bali</small></div></div>
    <nav class="nav">${items.map(a).join('')}</nav>
    <div class="side-note"><b>Sumber</b>Pergub Bali No. 64 Tahun 2023, Lampiran I<span>hlm 11–149 PDF</span></div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const sb = document.querySelector('.sidebar');
  if (sb) sb.innerHTML = sidebar(sb.dataset.active);
  document.querySelectorAll('i[data-i]').forEach(e => e.outerHTML = icon(e.dataset.i, e.className));
});
