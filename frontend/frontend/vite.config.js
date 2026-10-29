import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8080',
      '/admin': {
        target: 'http://localhost:8080',
        // The frontend also owns /admin/dashboard. Serve browser document
        // navigations from Vite so React Router can render; API fetches continue
        // to proxy to Spring.
        bypass: (req) => req.headers.accept?.includes('text/html') ? req.url : undefined
      },
      '/students': 'http://localhost:8080',
      '/faculty': 'http://localhost:8080'
    }
  }
});
