/// <reference types="vitest" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest/config" />
import path from 'path';

import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
      pool: 'vmThreads',
      globals: true,
      environment: 'jsdom',
      watch: false,
      css: true,
      include: ['**/__tests__/**', '**/src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
      exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
      setupFiles: ['./test/setupTests.ts'],
      server: {
        deps: {
          inline: [
            '@aderant/stridyn-components',
            '@aderant/stridyn-foundation',
            '@aderant/stridyn-askmaddi',
          ],
        },
      },
    },
  }),
);
