import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Avoid CORS + local dev HTTPS cert issues by proxying API calls through Vite.
      // Frontend calls `/api/...` and Vite forwards to the .NET backend.
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://localhost:7087',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://localhost:7087',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
