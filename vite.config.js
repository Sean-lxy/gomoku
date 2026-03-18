import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'
  
  return {
    base: isProd ? '/gomoku/' : '/',
    plugins: [react()],
    define: {
      'import.meta.env.VITE_MINIMAX_API_KEY': JSON.stringify(env.VITE_MINIMAX_API_KEY || ''),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
      'import.meta.env.DEV': JSON.stringify(!isProd)
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  }
})
