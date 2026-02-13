import { PlayCircleIcon, StopCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useIntl } from "react-intl"
import { Kbd } from "@/components/kbd/kbd"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useModuleHotkeys } from "@/hooks/use-module-hotkeys"
import { cn } from "@/lib/utils"
import LogExplorerModule from "@/modules/log-explorer"

type ToggleLiveButtonProps = {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export function ToggleLiveButton(props: ToggleLiveButtonProps) {
  const intl = useIntl()
  const moduleHotkeys = useModuleHotkeys(LogExplorerModule)

  const label = intl.formatMessage({ id: "logExplorer.liveMode" })
  const hotkey = moduleHotkeys.getHotkey("liveMode")

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Toggle
            aria-label={label}
            variant="outline"
            className={cn(
              "shrink-0 px-2.5 bg-muted/20 aria-pressed:bg-muted/20",
              props.pressed && "animate-border-glow"
            )}
            pressed={props.pressed}
            onPressedChange={props.onPressedChange}
          />
        }
      >
        <div
          className={cn("flex items-center", props.pressed && "text-blue-400")}
        >
          <HugeiconsIcon
            icon={props.pressed ? StopCircleIcon : PlayCircleIcon}
            strokeWidth={2}
            className="mr-1.5 w-[18px] h-[18px]"
          />
          <div className="whitespace-nowrap">{label}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="flex space-x-1.5">
        <div>{hotkey?.description}</div>
        <Kbd>{hotkey?.keystroke}</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}
