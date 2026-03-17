import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/smooth-page.ts']
    })
  ],
  server: {
    open: '/examples/index.html'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/smooth-page.ts'),
      name: 'SmoothPage',
      fileName: (format) => `smooth-page.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'smooth-page.[ext]'
      }
    },
    minify: true,
    sourcemap: true
  }
});
