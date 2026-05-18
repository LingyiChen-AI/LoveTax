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
    singleThread: true,
    passWithNoTests: true,
    setupFiles: ['tests/integration/helpers/setup.ts'],
    testTimeout: 20000
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } }
});
