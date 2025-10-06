import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://namma-koda1234-qk8v.vercel.app',
        changeOrigin: true,
        ws: true,
        secure: false
      }
    }
  }
})


