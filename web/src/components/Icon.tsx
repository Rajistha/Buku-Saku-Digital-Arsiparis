import { useId } from 'react'

const P: Record<string, string> = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  tree: '<path d="M3 5h6M3 12h6M3 19h6"/><path d="M13 5h8M15 12h6M15 19h6"/><path d="M9 5h2v14H9M11 12h2M11 19h2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  chevl: '<path d="m15 18-6-6 6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  wifiOff: '<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.4-1.6M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8a15 15 0 0 0-11.7-3.7M12 20h.01"/>',
  law: '<path d="M12 3v18M5 21h14M6 7h12"/><path d="m6 7-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
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
}

export function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <svg className={`ic ${className}`} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: P[name] ?? '' }} />
}

export function BidangIcon({ kode }: { kode: string }) {
  return (
    <span className={`bi g${kode}`}>
      <Icon name={`b${kode}`} />
    </span>
  )
}

export function Logo() {
  // id gradien harus unik: logo tampil di sidebar dan di bilah atas mobile
  const id = `lg${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Logo Buku Saku Digital Pemprov Bali">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7283F5" />
          <stop offset="1" stopColor="#3E4FD3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d="M17 14a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v30H17z" fill="#fff" />
      <path d="M17 14a4 4 0 0 1 4-4h1.6v34H17z" fill="#D9DFFF" />
      <path d="M41 10h5v13.5l-2.5-2.3L41 23.5z" fill="#FFC861" />
      <path d="M34 20.5 28.6 30.6M34 20.5 38.8 30.6" stroke="#5468E7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <g fill="#5468E7">
        <circle cx="34" cy="19.6" r="2.6" />
        <circle cx="28.6" cy="30.6" r="2.3" />
        <circle cx="38.8" cy="30.6" r="2.3" />
      </g>
      <path d="M12.5 38h39v9.2L32 56 12.5 47.2z" fill="#2B37A8" stroke="#2B37A8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M17 42h30v3.6L32 51.6 17 45.6z" fill="none" stroke="#8FA0FF" strokeWidth="1.3" strokeLinejoin="round" strokeDasharray="2.6 2.2" />
    </svg>
  )
}
