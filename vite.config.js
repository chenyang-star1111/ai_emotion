import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const API_BASE = 'http://159.75.169.224:1235'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_BASE,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/api')
      },
      '/files': {
        target: API_BASE,
        changeOrigin: true
      },
      '/file': {
        target: API_BASE,
        changeOrigin: true
      }
    }
  }
})
