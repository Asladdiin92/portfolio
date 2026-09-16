import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@portfolio/shared': resolve(import.meta.dirname, '../../packages/shared/src/index.ts'),
    },
  },
  define: {
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify('lvf8z9ck'),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  appType: 'spa',
})
