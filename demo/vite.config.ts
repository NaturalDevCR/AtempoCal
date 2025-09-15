import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/**
 * Vite configuration for AtempoCal demo application
 * Separate from the library build configuration
 */
export default defineConfig({
  plugins: [vue()],
  
  // Development server configuration
  server: {
    port: 5174,
    host: true,
    open: true
  },
  
  // Build configuration for demo deployment
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@lib': resolve(__dirname, '../src')
    }
  },
  
  // CSS configuration
  css: {
    postcss: resolve(__dirname, './postcss.config.js')
  },
  
  // Define global constants
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
})