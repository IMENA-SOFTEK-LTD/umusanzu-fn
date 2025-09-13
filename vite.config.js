import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'



export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env': env
    },
    server: {
    host: "::",
    port: 8080,
  },
    plugins: [react()],
    esbuild: {
      jsxInject: `import React from 'react';`,
    },
  }
})
