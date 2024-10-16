import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // For React projects, you can replace with '@vitejs/plugin-vue' for Vue

export default defineConfig({
  plugins: [react()],  // Add the appropriate plugin for your framework
  server: {
    port: 5173,        // Set custom development server port
  },
  build: {
    outDir: 'dist',    // Output directory for build
  },
  resolve: {
    alias: {
      '@': '/src',     // Alias to easily import from the src folder
    },
  },
})
