import { Settings01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

export function SettingsButton() {
  const handleClick = () => {}

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={"Settings"}
            variant={"secondary"}
            size={"sm"}
            onClick={handleClick}
          />
        }
      >
        <HugeiconsIcon
          icon={Settings01Icon}
          strokeWidth={2}
          className="h-4 w-4"
        />
      </TooltipTrigger>
      <TooltipContent>Settings</TooltipContent>
    </Tooltip>
  )
}
