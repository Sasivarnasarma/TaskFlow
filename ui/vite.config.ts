/// <reference types="vitest" />
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApiUrl = env.VITE_DEV_API_URL || 'http://127.0.0.1:8000'

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version || '0.0.0'),
    },
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: devApiUrl,
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      testTimeout: 20000,
    },
  }
})
