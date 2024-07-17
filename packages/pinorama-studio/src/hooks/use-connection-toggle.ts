import { useAppConfig } from "@/contexts"

export function useConnectionToggle() {
  const appConfig = useAppConfig()

  const connectionStatus = appConfig?.config.connectionStatus
  const isConnected = connectionStatus === "connected"

  return {
    isConnected,
    toggleConnection: () => {
      appConfig?.setConfig({
        ...appConfig.config,
        connectionStatus: isConnected ? "disconnected" : "connected"
      })
    }
  }
}
