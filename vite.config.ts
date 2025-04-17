import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use React as the JSX runtime
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add alias for jsx runtime to fix the import error
      '@react-three/fiber/jsx-runtime': '@react-three/fiber',
      '@react-three/fiber/jsx-dev-runtime': '@react-three/fiber'
    },
  },
  assetsInclude: ['**/*.glb'],
})