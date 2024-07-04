import "./styles/globals.css"

import React from "react"
import ReactDOM from "react-dom/client"

import { PinoramaClientProvider, ThemeProvider } from "@/contexts"
import App from "./app"

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="pinorama-studio-theme">
      <PinoramaClientProvider options={{ url: "http://localhost:6200" }}>
        <App />
      </PinoramaClientProvider>
    </ThemeProvider>
  </React.StrictMode>
)
