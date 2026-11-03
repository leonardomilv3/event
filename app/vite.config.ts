// app/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return

          // Ordem importa: react-dom e react-router precisam vir antes de "react/"
          if (
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler')
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('node_modules/i18next') ||
            id.includes('node_modules/react-i18next')
          ) {
            return 'vendor-i18n'
          }

          if (
            id.includes('node_modules/posthog-js') ||
            id.includes('node_modules/@vercel/analytics')
          ) {
            return 'vendor-analytics'
          }

          // Qualquer outro node_modules → chunk genérico
          return 'vendor'
        },
      },
    },
  },
})