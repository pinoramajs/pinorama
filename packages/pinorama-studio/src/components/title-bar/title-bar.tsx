import { ConnectionStatus } from "../connection-status/connection-status"
import { PinoramaLogo } from "../pinorama-logo/pinorama-logo"
import { ThemeToggle } from "../theme-toggle/theme-toggle"

export function TitleBar() {
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
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
