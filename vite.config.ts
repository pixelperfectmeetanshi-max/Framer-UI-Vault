import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

// Plugin to copy icon.png to dist folder
const copyIconPlugin = () => ({
  name: 'copy-icon',
  closeBundle() {
    const src = resolve(__dirname, 'icon.png');
    const destDir = resolve(__dirname, 'dist');
    const dest = resolve(destDir, 'icon.png');
    
    if (existsSync(src)) {
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      copyFileSync(src, dest);
      console.log('✓ Copied icon.png to dist/');
    }
  }
});

export default defineConfig({
  base: "./",

  plugins: [react(), copyIconPlugin()],

  build: {
    target: "esnext",
    rollupOptions: {
      // Don't externalize framer-plugin - let it be bundled but handle errors at runtime
      onwarn(warning, warn) {
        // Suppress warnings about framer-plugin
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      }
    }
  },

  esbuild: {
    target: "esnext"
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "esnext"
    }
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
});