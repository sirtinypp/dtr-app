import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), basicSsl()],
    server: {
        host: true, // Expose to network
        https: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
            '/media': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})
