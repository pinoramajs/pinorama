import { useAppConfig } from "@/contexts"
import { Button } from "../ui/button"

export function ConnectionToggle() {
  const appConfig = useAppConfig()

  const connectionStatus = appConfig?.config.connectionStatus

  const text = connectionStatus === "connected" ? "Disconnect" : "Connect"

  const handleClick = () => {
    appConfig?.setConfig({
      ...appConfig.config,
      connectionStatus:
        connectionStatus === "connected" ? "disconnected" : "connected"
    })
  }

  return (
    <Button variant={"outline2"} size={"sm"} onClick={handleClick}>
      {text}
    </Button>
  )
}
