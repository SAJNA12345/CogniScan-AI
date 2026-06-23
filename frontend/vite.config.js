import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // In dev, the frontend calls relative `/api/...` URLs which Vite proxies to
  // the backend. In production the frontend and API are served behind one
  // origin/gateway, so the same relative URLs work unchanged.
  const apiTarget = env.VITE_API_PROXY || 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
