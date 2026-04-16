import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { healthCheckPlugin } from './vite-plugin-health'

export default defineConfig({
  envPrefix: [
    'VITE_',
    'TWITCH_CLIENT_ID',
    'AUTH_SERVICE_URL',
    'ACHIEVEMENT_MANAGEMENT_SERVICE_URL',
    'FRONT_URL',
  ],
  plugins: [react(), healthCheckPlugin()],
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      'front-dev-549742522303.europe-west1.run.app',
      '.run.app',
      '.cloudfunctions.net',
    ],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
})
