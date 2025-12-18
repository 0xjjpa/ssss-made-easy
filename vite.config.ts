import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const singlefile = mode === 'singlefile';
  return {
    plugins: [],
    build: {
      outDir: 'build',
      assetsInlineLimit: singlefile ? Number.MAX_SAFE_INTEGER : 4096,
      cssCodeSplit: !singlefile ? true : false,
      rollupOptions: singlefile
        ? {
            output: {
              inlineDynamicImports: true,
              manualChunks: undefined,
            },
          }
        : undefined,
    },
    resolve: {
      alias: [
        { find: 'react/jsx-runtime', replacement: path.resolve(__dirname, 'src/lib/react-jsx-runtime') },
        { find: 'react-dom/client', replacement: path.resolve(__dirname, 'src/lib/react-dom-client') },
        { find: 'react-router-dom', replacement: path.resolve(__dirname, 'src/lib/react-router-dom') },
        { find: 'react', replacement: path.resolve(__dirname, 'src/lib/react') },
      ],
    },
    server: {
      port: 5173,
    },
  };
});
