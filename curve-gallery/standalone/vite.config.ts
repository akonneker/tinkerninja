import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import { fileURLToPath } from "node:url";
export default defineConfig({
  base: "/curves/",
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  resolve: { alias: { "@": fileURLToPath(new URL("..", import.meta.url)) } },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { sourcemap: false },
});
