import { createContext, useContext, useEffect, useState } from "react"

export type AppConfig = {
  connectionIntent: boolean
  connectionUrl?: string | null
}

type AppConfigContextType = {
  config: AppConfig
  setConfig: (config: AppConfig) => void
}

const DEFAULT_CONFIG: AppConfig = {
  connectionIntent: false,
  connectionUrl: "http://localhost:6200"
}

const getAppConfigFromQueryParams = () => {
  const appConfig: Partial<AppConfig> = {}
  const params = new URLSearchParams(window.location.search)

  const connectionUrl = params.get("connectionUrl")
  if (connectionUrl) {
    appConfig.connectionUrl = connectionUrl
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
    <AppConfigContext.Provider value={{ config, setConfig }}>
      {props.children}
    </AppConfigContext.Provider>
  )
}

export const useAppConfig = () => {
  const context = useContext(AppConfigContext)

  if (context === undefined) {
    throw new Error("useAppConfig must be used within a AppConfigProvider")
  }

  return context
}
