import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { SettingsIcon } from "lucide-react"

export function SettingsButton() {
  const handleClick = () => {}

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={"Settings"}
          variant={"secondary"}
          size={"sm"}
          onClick={handleClick}
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Settings</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
