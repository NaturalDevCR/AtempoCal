import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

/**
 * Vite configuration for AtempoCal library build
 * Builds the component for npm distribution
 */
export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*']
    })
  ],
  
  // Library build configuration
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AtempoCal',
      formats: ['es', 'umd'],
      fileName: (format) => `atempo-cal.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: ['vue', 'atemporal'],
      output: {
        globals: {
          vue: 'Vue',
          atemporal: 'atemporal'
        },
        // Fix for named and default exports warning
        exports: 'named',
        // Preserve CSS as separate file
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'atempo-cal.css'
          }
          return assetInfo.name || 'asset'
        }
      }
    },
    sourcemap: true,
    // Ensure CSS is extracted
    cssCodeSplit: false
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // CSS preprocessing
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})