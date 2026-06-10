import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Suppress chunk size warnings for vendor libraries
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor chunks — separate caches for stable libraries
        // Vite 8 / Rolldown requires a function, not an object
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
        }
      }
    }
  }
})
