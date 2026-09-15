import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    // Expose Cloudinary cloud name to client — not a secret
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
