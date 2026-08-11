import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({ include: "**/*.{jsx,js,tsx,ts}" })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
