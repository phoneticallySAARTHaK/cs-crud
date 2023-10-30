import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      filename: "sw.ts",
      srcDir: "src/serviceWorker",
      outDir: "dist/",
      injectRegister: null,
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,json}"],
      },
      manifest: null,
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "/index.html",
        resolveTempFolder() {
          return "dist";
        },
      },
    }),
  ],
});
