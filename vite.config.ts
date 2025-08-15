import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
    },
  },

  // Développement avec Rails sur port 3000
  define: {
    'process.env.RAILS_API_URL': JSON.stringify(
      process.env.RAILS_API_URL || 'http://localhost:3000'
    ),
  },
})