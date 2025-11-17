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
          // Vendor chunks - estratégia simplificada para evitar problemas com React
          if (id.includes('node_modules')) {
            // Mermaid separado (muito grande e carregado dinamicamente)
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            // Socket.io separado (não depende do React)
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            // Markdown tools separados (não dependem do React)
            if (id.includes('marked') || id.includes('highlight.js')) {
              return 'vendor-markdown';
            }
            // Estilos separados (não dependem do React)
            if (id.includes('tailwindcss') || id.includes('postcss') || id.includes('autoprefixer')) {
              return 'vendor-styles';
            }
            // TUDO que pode usar React vai para vendor-react
            // Isso garante que React esteja sempre disponível
            return 'vendor-react';
          }
        },
        // Limitar número de chunks para reduzir overhead
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Limitar paralelismo
      maxParallelFileOps: 2
    },
    // Garantir que os chunks sejam carregados na ordem correta
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
      }
  },
  // Resolver dependências do React
  resolve: {
    dedupe: ['react', 'react-dom']
  }
})
