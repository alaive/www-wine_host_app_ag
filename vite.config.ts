import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensure assets are relative for Apache subdirectories
  server: {
    proxy: {
      // Forward /php/* to MAMP's Apache so PHP is executed server-side.
      // Adjust the port if MAMP uses a different one (default is 8888).
      '/php': {
        target: 'http://localhost:8888/e-nologo/e-nologo-interactive/public',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\./, ''), // strip leading dot: ./php → /php
      },
    },
  },
})
