import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://1f01-146-196-34-90.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://1f01-146-196-34-90.ngrok-free.app',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})