import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // This is the magic line that makes the app work in GitHub Pages
  plugins: [
    react(),
    // PWA is disabled during rapid beta iteration to prevent stale service-worker builds.
    // public/sw.js is a temporary self-destroy worker that unregisters old deployments.
  ]
})
