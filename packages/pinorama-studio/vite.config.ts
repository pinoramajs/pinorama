import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import version from "vite-plugin-package-version"

export default defineConfig({
  plugins: [react(), version()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
