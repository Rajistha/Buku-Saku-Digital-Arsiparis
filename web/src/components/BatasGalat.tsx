import { Component, type ReactNode } from 'react'

/** Menangkap kegagalan memuat bagian aplikasi yang dimuat belakangan (mis. penampil PDF saat sinyal hilang). */
export default class BatasGalat extends Component<{ children: ReactNode; pesan: string }, { gagal: boolean }> {
  state = { gagal: false }

  static getDerivedStateFromError() {
    return { gagal: true }
  }

  render() {
    if (!this.state.gagal) return this.props.children
    return (
      <div className="boot">
        <b>{this.props.pesan}</b>
        <span>Periksa koneksi internet, lalu coba lagi.</span>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            window.location.hash = '#/'
            window.location.reload()
          }}
        >
          Ke Beranda
        </button>
      </div>
    )
  }
}
