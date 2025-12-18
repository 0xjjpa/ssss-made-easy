import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'singlefile' ? viteSingleFile({ removeViteModuleLoader: true }) : undefined,
  ].filter(Boolean),
  build: {
    outDir: 'build',
  },
  server: {
    port: 5173,
  },
}));
