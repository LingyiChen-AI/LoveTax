import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    globals: false,
    sequence: { concurrent: false },
    fileParallelism: false,
    passWithNoTests: true,
    setupFiles: ['tests/integration/helpers/setup.ts'],
    testTimeout: 20000,
    server: {
      deps: {
        // Force next-auth through Vite so resolve.alias applies inside it
        inline: ['next-auth', '@auth/core']
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // Resolve bare specifiers that next-auth uses in ESM context on Node 24
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
      'next/cache': path.resolve(__dirname, 'node_modules/next/cache.js'),
      'next/navigation': path.resolve(__dirname, 'node_modules/next/navigation.js'),
      'next/headers': path.resolve(__dirname, 'node_modules/next/headers.js')
    }
  }
});
