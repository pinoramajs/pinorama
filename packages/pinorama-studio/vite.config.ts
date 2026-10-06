import path from "node:path"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import version from "vite-plugin-package-version"

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    version()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src")
    }
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "ui",
              test: /node_modules\/(@base-ui\/react|react-resizable-panels|react-day-picker|react-json-view-lite)\//
            },
            {
              name: "tanstack",
              test: /node_modules\/@tanstack\/(react-table|react-virtual|react-query|react-router)\//
            }
          ]
        }
      }
    }
  }
})
