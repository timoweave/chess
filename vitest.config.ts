import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['./tests/**/*.test.*'],
      exclude: ['./tests/**/*.spec.*', '**/node_modules/**'],
      reporters: ['verbose'],
      root: './',
      globals: false,
    },
  }),
);
