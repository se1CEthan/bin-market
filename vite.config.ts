import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: 'es2018',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    // Enable cache busting with content-based hashing
    rollupOptions: {
      output: {
        // Add timestamp and content hash to filenames for cache busting
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: (assetInfo) => {
          if (!assetInfo.names || assetInfo.names.length === 0) {
            return `assets/[name]-[hash]-${Date.now()}[extname]`;
          }
          const name = assetInfo.names[0];
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/img/[name]-[hash]-${Date.now()}[extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash]-${Date.now()}[extname]`;
          }
          return `assets/[name]-[hash]-${Date.now()}[extname]`;
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'vendor_icons';
            if (id.includes('framer-motion')) return 'vendor_motion';
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

});
