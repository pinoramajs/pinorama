import { Button } from "@/components/ui/button"
import { useConnectionToggle } from "@/hooks/use-connection-toggle"
import { FormattedMessage } from "react-intl"

export function ConnectionToggleButton() {
  const { isConnected, toggleConnection } = useConnectionToggle()

  return (
    <Button variant={"secondary"} size={"sm"} onClick={toggleConnection}>
      <FormattedMessage
        id={`connection.labels.${isConnected ? "disconnect" : "connect"}`}
      />
    </Button>
  )
}
