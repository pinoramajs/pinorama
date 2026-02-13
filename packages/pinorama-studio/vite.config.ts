import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import version from "vite-plugin-package-version"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"]
      }
    }),
    tailwindcss(),
    version()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ui: [
            "@base-ui/react",
            "react-resizable-panels",
            "react-day-picker",
            "react-json-view-lite"
          ],
          tanstack: [
            "@tanstack/react-table",
            "@tanstack/react-virtual",
            "@tanstack/react-query",
            "@tanstack/react-router"
          ]
        }
      }
    }
  }
})
