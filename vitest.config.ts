import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    setupFiles: './src/setupTests.js',
    css: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'packages/**',
    ],
  },
});
