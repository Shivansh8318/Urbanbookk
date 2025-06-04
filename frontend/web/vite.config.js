import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ad09-103-214-60-231.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://ad09-103-214-60-231.ngrok-free.app',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})