import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (!res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'BACKEND_UNAVAILABLE',
                message: 'Backend server is not running on port 5000. Start it with "npm run server" or run "npm run dev".'
              }));
            }
          });
        }
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, _res) => {
            // Silently suppress ECONNREFUSED terminal spam when backend is starting up or offline
          });
          proxy.on('proxyReqWs', (proxyReq) => {
            proxyReq.on('error', (_err) => {
              // Silently handle ws request errors
            });
          });
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
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
