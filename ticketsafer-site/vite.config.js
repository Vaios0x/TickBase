import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}']
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-icon.svg'],
      manifest: {
        name: 'TicketSafer - Boletos Seguros en Blockchain',
        short_name: 'TicketSafer',
        description: 'Plataforma descentralizada para la compra y venta segura de boletos utilizando tecnología blockchain',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['entertainment', 'finance', 'utilities'],
        lang: 'es-ES',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  
  // Configuración de desarrollo según Vite.dev/guide
  server: {
    port: 5173, // Puerto por defecto de Vite 5
    open: true,
    host: true, // Para acceso desde red local
    cors: true,
    // HMR optimizado
    hmr: {
      overlay: true
    }
  },
  
  // Pre-bundling optimizado según guía oficial
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react-dom/client',
      'wagmi',
      '@rainbow-me/rainbowkit',
      'viem',
      '@tanstack/react-query',
      'framer-motion'
    ],
    // Excluir dependencias que causan problemas
    exclude: ['@vite/client', '@vite/env']
  },
  
  // Configuración de build optimizada
  build: {
    // Target moderno según Browser Support de Vite
    target: ['es2022', 'chrome89', 'firefox89', 'safari15'],
    
    // Optimizaciones de minificación
    minify: 'esbuild',
    cssMinify: 'esbuild',
    
    // Chunk splitting inteligente
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk para React ecosystem
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor'
          }
          // Web3 chunk para blockchain libs
          if (id.includes('wagmi') || id.includes('rainbowkit') || id.includes('viem')) {
            return 'web3-vendor'
          }
          // UI libraries chunk
          if (id.includes('framer-motion') || id.includes('react-icons')) {
            return 'ui-vendor'
          }
          // Third party vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        // Nombres de archivos optimizados para caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk'
          return `js/${facadeModuleId}-[hash].js`
        },
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    
    // Source maps para debugging en producción
    sourcemap: false,
    
    // Reportar bundle size
    reportCompressedSize: true,
    
    // Limite de advertencia de chunk (500kb)
    chunkSizeWarningLimit: 500
  },
  
  // Variables de entorno
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // Configuración de CSS
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  
  // Resolución de módulos
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets'
    }
  },
  
  // Worker optimizations para Web3
  worker: {
    format: 'es'
  }
})
