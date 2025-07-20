// /vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // Configuración común para ambos modos
  const commonConfig = {
    plugins: [
      vue(),
      dts({ insertTypesEntry: true }),
    ],
  };

  if (command === 'serve') {
    // --- CONFIGURACIÓN PARA DESARROLLO (npm run dev) ---
    // No necesita la configuración de 'build.lib'. Vite usará
    // el `index.html` de la raíz por defecto.
    return {
      ...commonConfig,
    };
  } else {
    // --- CONFIGURACIÓN PARA PRODUCCIÓN (npm run build) ---
    return {
      ...commonConfig,
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'AtempoCal',
          fileName: (format) => `atempo-cal.${format}.js`,
        },
        rollupOptions: {
          external: ['vue', 'atemporal'],
          output: {
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
