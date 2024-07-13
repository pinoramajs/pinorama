import { useAppConfig } from "@/contexts"
import { FormattedMessage } from "react-intl"
import { Button } from "../ui/button"

export function ConnectionToggle() {
  const appConfig = useAppConfig()

  const isConnected = appConfig?.config.connectionStatus === "connected"

  const handleClick = () => {
    appConfig?.setConfig({
      ...appConfig.config,
      connectionStatus: isConnected ? "disconnected" : "connected"
    })
  }

  return (
    <Button
      variant={`${!isConnected ? "default" : "outline2"}`}
      size="sm"
      onClick={handleClick}
    >
      <FormattedMessage
        id={`actions.${isConnected ? "disconnect" : "connect"}`}
      />
    </Button>
  )
}
