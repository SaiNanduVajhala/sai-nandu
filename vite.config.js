import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to your GitHub repo name.
  // If deploying to https://SaiNanduVajhala.github.io/portfolio/ → use '/portfolio/'
  // If deploying to https://SaiNanduVajhala.github.io/ (user/org site) → use '/'
  base: '/sai-nandu/',
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
        },
      },
    },
  },
})

