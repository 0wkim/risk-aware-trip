import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
        },
        // 로컬용
        // '/seoul-api': {
        //   target: 'http://openapi.seoul.go.kr:8088',
        //   changeOrigin: true,
        //   secure: false,
        //   // App.tsx에서 요청한 '/seoul-api' 텍스트를 지우고 원래 API 주소에 갖다 붙임
        //   rewrite: (path) => path.replace(/^\/seoul-api/, ''), 
        // },
      },
    },
  };
});