import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// Check which build we're doing based on env var
const buildFormat = process.env.BUILD_FORMAT || 'es'

export default defineConfig({
  plugins: buildFormat === 'es' ? [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ] : [],
  build: {
    lib: {
      entry: buildFormat === 'es' 
        ? resolve(__dirname, 'src/index.ts')
        : resolve(__dirname, 'src/browser.ts'),
      name: 'Sika',
      formats: [buildFormat as 'es' | 'umd'],
      fileName: () => buildFormat === 'es' ? 'sika.js' : 'sika.umd.cjs',
    },
    rollupOptions: {
      output: {
        exports: buildFormat === 'umd' ? 'default' : 'named',
      },
    },
    minify: 'esbuild',
    sourcemap: true,
    emptyOutDir: buildFormat === 'es', // Only clean on first build
  },
})
