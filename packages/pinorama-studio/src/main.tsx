import "./styles/globals.css"

import { StrictMode, useEffect, useState } from "react"
import ReactDOM from "react-dom/client"
import { type IntlConfig, IntlProvider } from "react-intl"

import {
  AppConfigProvider,
  PinoramaClientProvider,
  ThemeProvider
} from "@/contexts"
import App from "./app"
import { TooltipProvider } from "./components/ui/tooltip"
import { defaultConfig, retrieveI18nConfig } from "./i18n"

const RootComponent = () => {
  const [i18nConfig, setI18nConfig] = useState<IntlConfig>(defaultConfig)

  useEffect(() => {
    retrieveI18nConfig().then(setI18nConfig)
  }, [])

  return (
    <StrictMode>
      <IntlProvider {...i18nConfig}>
        <ThemeProvider defaultTheme="dark" storageKey="pinorama-studio-theme">
          <AppConfigProvider>
            <PinoramaClientProvider>
              <TooltipProvider>
                <App />
              </TooltipProvider>
            </PinoramaClientProvider>
          </AppConfigProvider>
        </ThemeProvider>
      </IntlProvider>
    </StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <RootComponent />
)
