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

export const ConnectionStatus = Object.freeze({
  Disconnected: "disconnected",
  Connecting: "connecting",
  Connected: "connected",
  Failed: "failed",
  Unknown: "unknown"
}) satisfies Readonly<Record<Capitalize<ConnectionStatus>, ConnectionStatus>>

export function usePinoramaConnection() {
  const appConfig = useAppConfig()

  const introspection = usePinoramaIntrospection()
  usePinoramaStyles()

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.Unknown
  )

  const connectionIntent = appConfig?.config.connectionIntent

  useEffect(() => {
    switch (true) {
      case connectionIntent === false:
        setConnectionStatus(ConnectionStatus.Disconnected)
        break
      case introspection.status === "pending" &&
        introspection.fetchStatus === "fetching":
        setConnectionStatus(ConnectionStatus.Connecting)
        break
      case introspection.status === "success":
        setConnectionStatus(ConnectionStatus.Connected)
        break
      case introspection.status === "error":
        setConnectionStatus(ConnectionStatus.Failed)
        break
      default:
        setConnectionStatus(ConnectionStatus.Unknown)
        break
    }
  }, [connectionIntent, introspection])

  const isConnected = useMemo(
    () => connectionStatus === ConnectionStatus.Connected,
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
