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
          // Vendor chunks - estratégia otimizada
          if (id.includes('node_modules')) {
            // React e todas as dependências do React juntas (CRÍTICO)
            // Isso garante que React esteja sempre disponível
            if (id.includes('react') || id.includes('react-dom') || 
                id.includes('react-router') || id.includes('@radix-ui') ||
                id.includes('react-resizable-panels') || id.includes('sonner')) {
              return 'vendor-react';
            }
            // Mermaid separado (muito grande e pode ser carregado dinamicamente)
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            // Socket.io
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            // Markdown tools
            if (id.includes('marked') || id.includes('highlight.js')) {
              return 'vendor-markdown';
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
