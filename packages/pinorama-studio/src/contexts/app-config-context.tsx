import { createContext, use, useEffect, useState } from "react"

export type AppConfig = {
  connectionIntent: boolean
  connectionUrl?: string | null
  liveMode: boolean
}

type AppConfigContextType = {
  config: AppConfig
  setConfig: (config: AppConfig) => void
}

const DEFAULT_CONFIG: AppConfig = {
  connectionIntent: false,
  connectionUrl: "http://localhost:6200",
  liveMode: false
}

const getAppConfigFromQueryParams = () => {
  const appConfig: Partial<AppConfig> = {}
  const params = new URLSearchParams(window.location.search)

  const connectionUrl = params.get("connectionUrl")
  if (connectionUrl) {
    appConfig.connectionUrl = connectionUrl
  }

  const liveMode = params.get("liveMode")
  if (liveMode) {
    appConfig.liveMode = liveMode === "true"
  }

  return appConfig
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider(props: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const queryConfig = getAppConfigFromQueryParams()

    const autoConnect = !!queryConfig.connectionUrl
    if (autoConnect) {
      queryConfig.connectionIntent = true
    }

    setConfig((prevConfig) => ({ ...prevConfig, ...queryConfig }))
  }, [])

  return (
    <AppConfigContext value={{ config, setConfig }}>
      {props.children}
    </AppConfigContext>
  )
}

export const useAppConfig = () => {
  const context = use(AppConfigContext)

  if (context === undefined) {
    throw new Error("useAppConfig must be used within a AppConfigProvider")
  }

  return context
}
