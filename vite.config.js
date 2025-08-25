import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "MAPS_"],
  build: {
    rollupOptions: {
      input: "src/main.js",
      output: {
        entryFileNames: "main.js",
        chunkFileNames: "[name].js",
        manualChunks: {
          maps: ["src/maps.js"],
          pdf: ["src/pdf.js"],
        },
      },
    },
  },
});
