import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Faster JSX transform
      jsxRuntime: 'automatic',
    }),
  ],

  resolve: { alias: { '@': '/src' } },

  build: {
    target:              'es2020',
    minify:              'terser',
    sourcemap:           false,
    reportCompressedSize:true,
    chunkSizeWarningLimit: 600,

    terserOptions: {
      compress: {
        drop_console:    true,
        drop_debugger:   true,
        pure_funcs:      ['console.info','console.warn','console.debug','console.error'],
        passes:          2,
        ecma:            2020,
        // Remove dead code
        dead_code:       true,
        unused:          true,
      },
      format: { comments: false, ecma: 2020 },
      mangle: { toplevel: false },
    },

    rollupOptions: {
      output: {
        manualChunks(id) {
          // Firebase — separate chunk (largest dependency)
          if (id.includes('node_modules/firebase')) return 'firebase';
          // React core
          if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react/'))    return 'react-vendor';
          // Icons — separate (heavy but cacheable)
          if (id.includes('node_modules/lucide-react')) return 'icons';
          // Utilities
          if (id.includes('node_modules/date-fns'))     return 'date-fns';
          if (id.includes('node_modules/react-hot-toast')) return 'toast';
        },
        // Stable chunk names for better caching
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash].[ext]',
      },
      // Tree-shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
  },

  server: {
    port: 5173,
    hmr:  { overlay: true },
  },

  // Pre-bundle all heavy deps for faster dev HMR
  optimizeDeps: {
    include: [
      'firebase/app','firebase/auth','firebase/firestore',
      'react','react-dom','react-router-dom',
      'react-hot-toast','date-fns','lucide-react',
    ],
    // Don't optimize these — they're lazy loaded
    exclude: [],
  },

  esbuild: {
    target:       'es2020',
    // Remove all console.* in production builds
    drop:         ['console', 'debugger'],
    legalComments:'none',
  },
})
