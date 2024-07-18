import "./styles/globals.css"

import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  AppConfigProvider,
  I18nProvider,
  PinoramaClientProvider,
  ThemeProvider
} from "@/contexts"
import App from "./app"

const RootComponent = () => {
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

const appElement = document.getElementById("app") as HTMLElement
ReactDOM.createRoot(appElement).render(<RootComponent />)
