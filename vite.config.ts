import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    clearMocks: true,
    environment: 'jsdom',
    maxWorkers: 4,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10_000,
  },
  build: {
    cssCodeSplit: true,
    minify: 'esbuild',
    reportCompressedSize: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-vendor': [
            '@emotion/react',
            '@emotion/styled',
            '@mui/icons-material',
            '@mui/material',
          ],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@theme': fileURLToPath(new URL('./src/theme', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    },
  },
});
