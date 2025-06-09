import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { pwaConfig } from "./pwa.config";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaConfig)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["test.achievly.ru", "localhost"],
  },
});
