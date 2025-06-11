import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://urbanbookk-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://urbanbookk-1.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})