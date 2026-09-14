import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️  Cambia 'calcetto-presidenziale' con il nome esatto del tuo repository GitHub
export default defineConfig({
  plugins: [react()],
  base: '/calcetto-presidenziale/',
})
