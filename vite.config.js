import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

/**
 * HTML Component Inclusion Plugin
 * Resolves <include src="components/*.html" /> tags into their respective HTML files.
 * Supports hot reload (HMR) when any component HTML file is edited.
 */
function htmlComponentPlugin() {
  return {
    name: 'vite-plugin-html-components',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const includeRegex = /<(?:include|component)\s+src=["']([^"']+)["']\s*(?:\/>|>\s*<\/(?:include|component)>)/gi;
        return html.replace(includeRegex, (match, srcPath) => {
          const resolvedPath = path.resolve(process.cwd(), srcPath);
          if (fs.existsSync(resolvedPath)) {
            if (ctx?.server) {
              ctx.server.watcher.add(resolvedPath);
            }
            return fs.readFileSync(resolvedPath, 'utf-8');
          }
          console.warn(`[htmlComponentPlugin] File not found: ${resolvedPath}`);
          return match;
        });
      }
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.html')) {
        server.ws.send({
          type: 'full-reload',
          path: '*'
        });
      }
    },
    closeBundle() {
      if (fs.existsSync('assets')) {
        fs.cpSync('assets', path.resolve(process.cwd(), 'dist/assets'), { recursive: true });
      }
    }
  };
}

export default defineConfig({
  plugins: [htmlComponentPlugin()],
  resolve: {
    alias: {
      'three': path.resolve(__dirname, './js/vendor/three.module.js'),
      'three/addons/controls/OrbitControls.js': path.resolve(__dirname, './js/vendor/OrbitControls.js')
    }
  },
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
