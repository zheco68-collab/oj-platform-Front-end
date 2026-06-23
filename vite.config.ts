/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    css: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  optimizeDeps: {
    include: [
      'codemirror',
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/commands',
      '@codemirror/lang-cpp',
      '@codemirror/lang-python',
      '@codemirror/lang-java',
      '@codemirror/lang-go',
      '@codemirror/theme-one-dark',
    ],
  },
})
