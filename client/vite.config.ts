import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  define: {
    // Inject API base URL at build time. Override with VITE_API_BASE_URL env var in Vercel.
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL || '')
  }
});
