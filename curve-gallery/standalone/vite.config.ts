import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/postcss";
import { fileURLToPath } from "node:url";
export default defineConfig({
  base: "/curves/",
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  resolve: { alias: { "@": fileURLToPath(new URL("..", import.meta.url)) } },
  plugins: [
    react(),
    {
      name: "katex-woff2-only",
      enforce: "pre",
      transform(source, id) {
        if (!id.replaceAll("\\", "/").endsWith("/katex/dist/katex.min.css")) return;
        // Modern browsers use WOFF2; omit duplicate TTF/WOFF assets from the site.
        return source.replace(/src:([^;}]+)/g, (_declaration, value: string) => {
          const woff2 = value.split(",").find((entry) => entry.includes(".woff2"));
          if (!woff2) throw new Error("KaTeX font is missing its WOFF2 source");
          return `src:${woff2}`;
        });
      },
    },
  ],
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { sourcemap: false, assetsInlineLimit: 0 },
});
