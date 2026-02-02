import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://13.127.187.19:5010',
        changeOrigin: true,
      },
    },
  },
  // For production build
  build: {
    outDir: 'dist',
  },
});