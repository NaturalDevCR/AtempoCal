// /vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // Common configuration for both modes
  const commonConfig = {
    plugins: [
      vue(),
      dts({ insertTypesEntry: true }),
    ],
  };

  if (command === 'serve') {
    // --- DEVELOPMENT CONFIGURATION (npm run dev) ---
    // It doesn't need the 'build.lib' configuration. Vite will
    // use the `index.html` from the root by default.
    return {
      ...commonConfig,
    };
  } else {
    // --- PRODUCTION CONFIGURATION (npm run build) ---
    return {
      ...commonConfig,
      build: {
        lib: {
          // The entry point for the library build.
          entry: resolve(__dirname, 'src/index.ts'),
          // The name for the global variable in UMD build.
          name: 'AtempoCal',
          // The file name for the generated bundles.
          fileName: (format: string) => `atempo-cal.${format}.js`,
        },
        rollupOptions: {
          // Externalize dependencies that shouldn't be bundled.
          external: ['vue', 'atemporal'],
          output: {
            // Provide global variables to use in the UMD build
            // for externalized deps.
            globals: {
              vue: 'Vue',
              atemporal: 'Atemporal',
            },
          },
        },
      },
    };
  }
});
