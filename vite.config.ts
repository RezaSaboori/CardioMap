import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'glsl-loader',
      transform(code, id) {
        if (id.endsWith('.glsl')) {
          // Remove any comments and clean up the code
          const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').trim();
          return {
            code: `export default ${JSON.stringify(cleanCode)};`,
            map: null
          }
        }
      }
    }
  ],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['three']
  }
})
