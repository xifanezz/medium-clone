import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.NEXT_PUBLIC_X_API_KEY' : JSON.stringify(env.NEXT_PUBLIC_X_API_KEY)

    },
  }
})
