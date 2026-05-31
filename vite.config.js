import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base dynamically: '/portfolio/' for GitHub Pages, '/' for Vercel or local dev.
  base: process.env.GITHUB_ACTIONS === 'true' ? '/portfolio/' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor code for better caching (function form for Rolldown/Vite 8)
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/three')) {
            return 'three';
          }
          if (id.includes('node_modules/@react-three')) {
            return 'r3f';
          }
        },
      },
    },
  },
})

