import "./styles/globals.css"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  AppConfigProvider,
  I18nProvider,
  PinoramaClientProvider,
  ThemeProvider
} from "@/contexts"
import { StrictMode } from "react"
import App from "./app"

export function RootComponent() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="pinorama-studio-theme">
        <I18nProvider>
          <AppConfigProvider>
            <PinoramaClientProvider>
              <TooltipProvider>
                <App />
              </TooltipProvider>
            </PinoramaClientProvider>
          </AppConfigProvider>
        </I18nProvider>
      </ThemeProvider>
    </StrictMode>
  )
}
