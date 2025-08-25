import { defineConfig } from "vite";

export default defineConfig({
  envPrefix: ["VITE_", "MAPS_"],
  build: {
    rollupOptions: {
      input: {
        main: "src/main.js",
        "turf-form": "src/turf-form.js",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        manualChunks: {
          maps: ["src/maps.js"],
          pdf: ["src/pdf.js"],
        },
      },
    },
  },
});
