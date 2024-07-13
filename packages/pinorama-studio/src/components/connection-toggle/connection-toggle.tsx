import { useAppConfig } from "@/contexts"
import { FormattedMessage } from "react-intl"
import { Button } from "../ui/button"

export function ConnectionToggle() {
  const { isConnected, toggleConnection } = useConnectionToggle()

  return (
    <Button variant={"secondary"} size={"sm"} onClick={toggleConnection}>
      <FormattedMessage
        id={`actions.${isConnected ? "disconnect" : "connect"}`}
      />
    </Button>
  )
}

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
