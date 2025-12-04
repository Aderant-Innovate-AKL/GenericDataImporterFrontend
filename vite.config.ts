import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  envPrefix: 'UI_',
  optimizeDeps: {
    include: ['xlsx'],
  },
});
