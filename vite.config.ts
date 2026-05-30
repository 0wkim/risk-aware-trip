import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 💡 프론트에서 /api로 시작하는 요청을 보내면 백엔드 터널 주소로 배달해줍니다.
      '/api': {
        target: 'https://sunny-oakland-median-conduct.trycloudflare.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});