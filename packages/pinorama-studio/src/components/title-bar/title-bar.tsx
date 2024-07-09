import { Settings } from "lucide-react"
import { ConnectionStatus } from "../connnection-status"
import { Button } from "../ui/button"

export function TitleBar() {
  return (
    <div className="border-t border-t-transparent border-b bg-muted/20">
      <div className="flex items-center justify-between text-[13px] h-full px-3">
        <div>🌀 Pinorama</div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <ConnectionStatus />
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="xs" onClick={() => {}}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
