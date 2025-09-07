import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@views": resolve(__dirname, "src/views"),
      "@stores": resolve(__dirname, "src/stores"),
      "@services": resolve(__dirname, "src/services"),
      "@utils": resolve(__dirname, "src/utils"),
      "@assets": resolve(__dirname, "src/assets"),
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true, // Allow external connections
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  // Build configuration
  build: {
    target: "esnext",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: process.env.NODE_ENV === "development",

    // Bundle optimization
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          charts: ["chart.js", "vue-chartjs"],
          ui: ["@headlessui/vue", "@heroicons/vue"],
        },
      },
    },

    // Performance budgets
    chunkSizeWarningLimit: 1000,
  },

  // CSS configuration - removed PostCSS config from here
  css: {
    devSourcemap: true,
  },

  // Environment variables prefix
  envPrefix: "VITE_",
});
