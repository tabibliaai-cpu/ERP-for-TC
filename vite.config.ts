import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.BUILD_VERSION': JSON.stringify(Date.now().toString()),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Append timestamp to output filenames to bust CDN/browser cache
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].[hash].${Date.now()}.js`,
          chunkFileNames: `assets/[name].[hash].${Date.now()}.js`,
          assetFileNames: `assets/[name].[hash].${Date.now()}.[ext]`,
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
