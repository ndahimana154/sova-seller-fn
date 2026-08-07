import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      proxy: {
        '/backend': {
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ''),
          target: env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:7070',
        },
        '/seller-backend': {
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/seller-backend/, ''),
          target: env.VITE_SELLER_API_PROXY_TARGET || 'http://137.184.42.115:7090',
        },
      },
    },
  }
})
