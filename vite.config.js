import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    define: {
      'process.env': env,
    },

    server: {
      host: '::',
      port: 5173,
    },

    plugins: [react()],

    esbuild: {
      // Strip console.* in production
      drop: isProd ? ['console', 'debugger'] : [],
    },

    build: {
      target: 'es2020',
      minify: 'esbuild',
      sourcemap: false,
      // Warn when any chunk exceeds 600 kB
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Deterministic hashed filenames for long-term caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  }
})
