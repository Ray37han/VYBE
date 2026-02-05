import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Build timestamp: 2026-02-05-v2
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Force new hashes on each build
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v2.js`,
        chunkFileNames: `assets/[name]-[hash]-v2.js`,
        assetFileNames: `assets/[name]-[hash]-v2.[ext]`
      }
    }
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces for global access
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
