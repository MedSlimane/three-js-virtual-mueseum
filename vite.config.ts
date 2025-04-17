import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use React Three Fiber as the JSX import source
      jsxImportSource: '@react-three/fiber',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Redirect JSX runtime imports to the main fiber package
      '@react-three/fiber/jsx-runtime': '@react-three/fiber',
      '@react-three/fiber/jsx-dev-runtime': '@react-three/fiber',
    },
  },
  assetsInclude: ['**/*.glb'],
})