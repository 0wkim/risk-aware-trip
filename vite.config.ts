import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 이 proxy 설정을 추가합니다!
    proxy: {
      '/api': {
        target: 'https://boards-cheapest-has-jets.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
