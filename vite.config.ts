
/// <reference types="node" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      }
    },
    server: {
      host: true
    }
  };
});
