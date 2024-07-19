import { Button } from "@/components/ui/button"
import { usePinoramaConnection } from "@/hooks"
import { FormattedMessage } from "react-intl"

export function ConnectionToggleButton() {
  const { isConnected, toggleConnection } = usePinoramaConnection()

  return (
    <Button variant={"secondary"} size={"sm"} onClick={toggleConnection}>
      <FormattedMessage
        id={`connection.labels.${isConnected ? "disconnect" : "connect"}`}
      />
    </Button>
  )
}
