import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            src: resolve(__dirname, 'src'),
        },
    },
    esbuild: {
        loader: 'tsx',
        include: /src\/.*\.tsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                {
                    name: 'load-js-files-as-tsx',
                    setup(build) {
                        build.onLoad(
                            { filter: /src\\.*\.js$/ },
                            async (args) => ({
                                loader: 'tsx',
                                contents: await fs.readFile(args.path, 'utf8'),
                            })
                        );
                    },
                },
            ],
        },
    },

    // 👇 Añadido para Cloudflare Tunnel
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    // Permite que Vite acepte el Host que llega desde el túnel
    // (si tu subdominio es fijo puedes usar: ['mi-subdominio.trycloudflare.com'])
    allowedHosts: true,
    hmr: {
      // Con túnel, el navegador conecta por 443 con WSS
      protocol: 'wss',
      clientPort: 443,
      // No fijamos "host": Vite usará window.location.hostname (tu URL del túnel)
    },
  },

  preview: {
    host: '127.0.0.1',
    port: 3000,
  },


    
    // plugins: [react(),svgr({
    //   exportAsDefault: true
    // })],

    plugins: [svgr(), react(), flowbiteReact()],
});