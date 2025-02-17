import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer1': resolve('src/renderer/renderer1/src'),
        '@renderer2': resolve('src/renderer/renderer2/src')
      }
    },
    plugins: [vue()],
    build: {
      rollupOptions: {
        input: {
          'renderer1/index.html': resolve('src/renderer/renderer1/index.html'),
          'renderer2/index.html': resolve('src/renderer/renderer2/index.html')
        }
      }
    }
  }
})
