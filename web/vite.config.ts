import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' agar hasil build bisa dibuka dari sub-folder mana pun (Netlify, GitHub Pages, dsb.)
export default defineConfig({
  base: './',
  plugins: [react()],
})
