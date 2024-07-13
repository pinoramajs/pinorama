import { FormattedMessage } from "react-intl"
import { ConnectionStatus } from "../connection-status/connection-status"
import { ConnectionToggle } from "../connection-toggle/connection-toggle"
import { PinoramaLogo } from "../pinorama-logo/pinorama-logo"
import { ThemeToggle } from "../theme-toggle/theme-toggle"
import { Button } from "../ui/button"

type TitleBarProps = {
  hasFilters: boolean
  onClearFilters: () => void
}

export function TitleBar(props: TitleBarProps) {
  return (
    <div className="border-b bg-muted/20">
      <div className="relative flex items-center justify-between text-sm font-normale h-full px-3">
        {/* Left */}
        <div className="flex items-center">
          <PinoramaLogo />
        </div>

        {/* Center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <ConnectionStatus />
        </div>

        {/* Right */}
        <div className="flex items-center space-x-1.5">
          {props.hasFilters && (
            <Button
              variant={"secondary"}
              size={"sm"}
              onClick={props.onClearFilters}
            >
              <FormattedMessage id="filters.clear" />
            </Button>
          )}
          <ConnectionToggle />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
