import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure environment variables are properly exposed to the frontend
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})
