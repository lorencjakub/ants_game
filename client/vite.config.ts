import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default ({ mode }) => {
    return defineConfig({
        plugins: [react()],
        define: {
            "process": { env: loadEnv(mode, process.cwd(), '') }
        }
    })
}