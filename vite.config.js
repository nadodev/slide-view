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
    // Reduzir uso de memória durante o build
    sourcemap: false,
    minify: 'esbuild', // Mais rápido e usa menos memória que terser
    target: 'esnext',
    cssCodeSplit: true,
    // Limitar paralelismo para reduzir uso de memória
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - estratégia mais agressiva
          if (id.includes('node_modules')) {
            // React primeiro (mais importante)
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Mermaid separado (muito grande)
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            // Socket.io
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Markdown tools
            if (id.includes('marked') || id.includes('highlight.js')) {
              return 'vendor-markdown';
            }
            // Radix UI
            if (id.includes('@radix-ui')) {
              return 'vendor-radix';
            }
            // Icons (lucide pode ser grande)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Estilos (Tailwind pode ser pesado)
            if (id.includes('tailwindcss') || id.includes('postcss') || id.includes('autoprefixer')) {
              return 'vendor-styles';
            }
            // Resto em chunks menores
            return 'vendor-other';
          }
        },
        // Limitar número de chunks para reduzir overhead
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Limitar paralelismo
      maxParallelFileOps: 2
    }
  }
})
