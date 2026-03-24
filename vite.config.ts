import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",

  plugins: [react()],

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