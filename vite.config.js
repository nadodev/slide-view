import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "003c6b022a11.ngrok-free.app"
    ]
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            if (id.includes('marked') || id.includes('highlight.js')) {
              return 'vendor-markdown';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Outras dependências grandes
            if (id.includes('tailwindcss') || id.includes('postcss')) {
              return 'vendor-styles';
            }
            // Chunk geral para outras dependências
            return 'vendor';
          }
        }
      }
    },
    // Otimizações de memória
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true
  }
})
