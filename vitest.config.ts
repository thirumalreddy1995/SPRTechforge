import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Unit tests: `npm test` (CI) or `npm run test:watch`.
// jsdom gives the pure-logic suites the `window` they expect and lets the
// component tests render with React Testing Library. Nothing here touches
// Firebase: modules that initialise it are not imported by any test.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'testing/**', 'scripts/**'],
    setupFiles: ['./tests/setup.ts'],
    css: false,
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: 'test-results/junit.xml' },
  },
});
