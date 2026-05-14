import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: Number(env.VITE_DEV_PORT ?? 5173),
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true,
    },
    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: isProd ? 'hidden' : true,
      cssCodeSplit: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
    },
    esbuild: {
      legalComments: 'none',
      drop: isProd ? ['console', 'debugger'] : [],
    },
  };
});
