import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Content-Security-Policy para el build estático (GitHub Pages).
// La API key del usuario vive en el navegador, así que limitamos a qué hosts puede
// conectarse o cargar recursos la página para reducir el riesgo de exfiltración vía XSS.
// Solo se inyecta en build: el modo dev de Vite necesita scripts inline (HMR).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://server.arcgisonline.com https://*.tile.openstreetmap.org",
  "connect-src 'self' data: blob: https://generativelanguage.googleapis.com https://nominatim.openstreetmap.org https://images.unsplash.com",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

const cspPlugin = (): Plugin => ({
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <meta name="referrer" content="strict-origin-when-cross-origin" />`,
    );
  },
});

export default defineConfig(() => {
  return {
    // Rutas relativas: el build funciona tanto en https://<usuario>.github.io/<repo>/ como en local
    base: './',
    plugins: [react(), tailwindcss(), cspPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
