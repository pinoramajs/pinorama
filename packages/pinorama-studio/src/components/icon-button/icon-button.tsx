import { Loading03Icon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Kbd } from "../kbd/kbd"

type IconButtonProps = ComponentProps<typeof Button> & {
  icon: IconSvgElement
  tooltip?: string
  loading?: boolean
  keystroke?: string
}

export function IconButton({
  variant = "outline",
  icon,
  tooltip,
  keystroke,
  loading,
  ...props
}: IconButtonProps) {
  const currentIcon = loading ? Loading03Icon : icon

  const component = (
    <Button className="px-2.5" variant={variant} disabled={loading} {...props}>
      <HugeiconsIcon
        icon={currentIcon}
        strokeWidth={2}
        className={cn("h-[18px] w-[18px]", loading && "animate-spin")}
      />
    </Button>
  )

  return tooltip || keystroke
    ? withTooltip(component, tooltip, keystroke)
    : component
}

function withTooltip(
  wrappedComponent: React.ReactElement,
  tooltip?: string,
  keystroke?: string
) {
  return (
    <Tooltip>
      <TooltipTrigger render={wrappedComponent} />
      <TooltipContent className="flex space-x-1.5">
        <div>{tooltip}</div>
        {keystroke ? <Kbd>{keystroke}</Kbd> : null}
      </TooltipContent>
    </Tooltip>
  )
}
