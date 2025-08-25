import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.MAPS_API_KEY": JSON.stringify(process.env.MAPS_API_KEY || ""),
  },
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
