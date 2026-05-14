import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/dist/' : '/',

  plugins: [
    react({
      // Configure le plugin React pour éviter les conflits
      jsxRuntime: 'automatic',
      babel: {
        plugins: []
      }
    })
  ],
  
  // Configuration pour intégration avec Rails
  root: './frontend',
  
  build: {
    outDir: '../public/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
      },
    },
  },

  server: {
    port: 3001,
    strictPort: true,
    hmr: {
      port: 3001,
    },
    // Proxy `/api/*` to the Rails dev server so the React app's relative
    // baseURL (`/api/v1`) works without setting VITE_RAILS_API_URL by hand.
    // Without this, fetch('/api/v1/...') hits Vite, which falls back to
    // index.html and the SPA reads "0 results" silently.
    proxy: {
      '/api': {
        target: process.env.RAILS_DEV_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
    },
  },

  // Développement avec Rails sur port 3000
  define: {
    'process.env.RAILS_API_URL': JSON.stringify(
      process.env.RAILS_API_URL || ''
    ),
  },
})
