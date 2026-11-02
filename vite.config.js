import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    const nid = id.replace(/\\/g, '/');
                    if (nid.includes('/node_modules/')) {
                        if (
                            nid.includes('/node_modules/react/') ||
                            nid.includes('/node_modules/react-dom/') ||
                            nid.includes('/node_modules/react-router/') ||
                            nid.includes('/node_modules/react-router-dom/') ||
                            nid.includes('/node_modules/scheduler/')
                        ) {
                            return 'vendor-react';
                        }
                        if (nid.includes('/node_modules/lucide-react/')) {
                            return 'vendor-icons';
                        }
                        if (nid.includes('/node_modules/apexcharts/')) {
                            return 'vendor-apexcharts';
                        }
                        if (nid.includes('axios') || nid.includes('sweetalert2')) {
                            return 'vendor-utils';
                        }
                    }
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
});
