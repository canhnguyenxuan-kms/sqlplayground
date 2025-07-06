import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  base: '/sqlplayground/',
  build: {
    outDir: '../dist',
    rollupOptions: {
      external: [],
      output: {
        format: 'es'
      }
    }
  },
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm']
  }
})