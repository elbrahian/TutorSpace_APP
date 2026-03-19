import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', 'lucide-react'],
          calendar: ['@fullcalendar/react', '@fullcalendar/daygrid'],
          stomp: ['@stomp/stompjs', 'sockjs-client'],
        },
      },
    },
  },
})
