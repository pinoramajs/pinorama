import { createContext, useContext, useEffect, useState } from "react"

export type AppConfig = {
  serverUrl: string
}

type AppConfigContextType = {
  config: AppConfig
  setConfig: (config: AppConfig) => void
}

type AppConfigProviderProps = {
  children: React.ReactNode
}

const DEFAULT_CONFIG: AppConfig = {
  serverUrl: "http://localhost:6200"
}

const getQueryParams = (): Partial<AppConfig> => {
  const params = new URLSearchParams(window.location.search)
  return {
    serverUrl: params.get("url") || DEFAULT_CONFIG.serverUrl
  }
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider(props: AppConfigProviderProps) {
  const queryConfig = getQueryParams()

  const [config, setConfig] = useState<AppConfig>({
    serverUrl: queryConfig.serverUrl || DEFAULT_CONFIG.serverUrl
  })

  useEffect(() => {
    const queryConfig = getQueryParams()
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
