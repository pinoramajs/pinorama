import { Tooltip, TooltipPortal, TooltipTrigger } from "@radix-ui/react-tooltip"
import { PlayCircleIcon, StopCircleIcon } from "lucide-react"
import { useIntl } from "react-intl"
import { Kbd } from "@/components/kbd/kbd"
import { Toggle } from "@/components/ui/toggle"
import { TooltipContent } from "@/components/ui/tooltip"
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
  const Icon = props.pressed ? StopCircleIcon : PlayCircleIcon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          aria-label={label}
          variant="outline"
          className={cn(
            "px-2.5 bg-muted/20 data-[state=on]:bg-muted/20",
            props.pressed && "border-blue-600"
          )}
          pressed={props.pressed}
          onPressedChange={props.onPressedChange}
        >
          <div
            className={cn(
              "flex items-center",
              props.pressed && "text-blue-400"
            )}
          >
            <Icon className="mr-1.5 w-[18px] h-[18px]" />
            <div className="whitespace-nowrap">{label}</div>
          </div>
        </Toggle>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent className="flex space-x-1.5">
          <div>{hotkey?.description}</div>
          <Kbd>{hotkey?.keystroke}</Kbd>
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
