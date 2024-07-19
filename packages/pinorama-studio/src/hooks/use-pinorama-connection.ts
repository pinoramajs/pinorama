import { useAppConfig } from "@/contexts"
import { useCallback, useEffect, useMemo, useState } from "react"
import { usePinoramaIntrospection } from "./use-pinorama-introspection"
import { usePinoramaStyles } from "./use-pinorama-styles"

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "failed"
  | "unknown"

export function usePinoramaConnection() {
  const appConfig = useAppConfig()

  const introspection = usePinoramaIntrospection()
  usePinoramaStyles()

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("unknown")

  const connectionIntent = appConfig?.config.connectionIntent

  useEffect(() => {
    switch (true) {
      case connectionIntent === false:
        setConnectionStatus("disconnected")
        break
      case introspection.status === "pending" &&
        introspection.fetchStatus === "fetching":
        setConnectionStatus("connecting")
        break
      case introspection.status === "success":
        setConnectionStatus("connected")
        break
      case introspection.status === "error":
        setConnectionStatus("failed")
        break
      default:
        setConnectionStatus("unknown")
        break
    }
  }, [connectionIntent, introspection])

  const isConnected = useMemo(
    () => connectionStatus === "connected",
    [connectionStatus]
  )

  const toggleConnection = useCallback(() => {
    appConfig?.setConfig({
      ...appConfig.config,
      connectionIntent: !connectionIntent
    })
  }, [appConfig, connectionIntent])

  return {
    connectionStatus,
    toggleConnection,
    isConnected,
    introspection: introspection.data
  }
}
