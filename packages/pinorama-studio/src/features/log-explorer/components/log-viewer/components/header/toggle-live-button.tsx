import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { PlayCircleIcon, StopCircleIcon } from "lucide-react"
import { useIntl } from "react-intl"

type ToggleLiveButtonProps = {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export function ToggleLiveButton(props: ToggleLiveButtonProps) {
  const intl = useIntl()
  const label = intl.formatMessage({ id: "logExplorer.live" })
  const Icon = props.pressed ? StopCircleIcon : PlayCircleIcon

  return (
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
        className={cn("flex items-center", props.pressed && "text-blue-400")}
      >
        <Icon className="mr-1.5 w-[18px] h-[18px]" />
        <div className="whitespace-nowrap">Live Mode</div>
      </div>
    </Toggle>
  )
}
