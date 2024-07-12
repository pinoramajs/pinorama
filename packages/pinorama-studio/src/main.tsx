import "./styles/globals.css"

import React from "react"
import ReactDOM from "react-dom/client"

import {
  AppConfigProvider,
  PinoramaClientProvider,
  ThemeProvider
} from "@/contexts"
import App from "./app"
import { TooltipProvider } from "./components/ui/tooltip"

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="pinorama-studio-theme">
      <AppConfigProvider>
        <PinoramaClientProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </PinoramaClientProvider>
      </AppConfigProvider>
    </ThemeProvider>
  </React.StrictMode>
)
