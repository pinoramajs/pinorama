import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { LoaderIcon, type LucideIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Kbd } from "../kbd/kbd"

type IconButtonProps = ComponentProps<typeof Button> & {
  icon: LucideIcon
  tooltip?: string
  loading?: boolean
  keystroke?: string
}

export function IconButton({
  variant = "outline2",
  icon,
  tooltip,
  keystroke,
  loading,
  ...props
}: IconButtonProps) {
  const Icon = loading ? LoaderIcon : icon

  const Component = (
    <Button className="px-2.5" variant={variant} disabled={loading} {...props}>
      <Icon className={cn("h-[18px] w-[18px]", loading && "animate-spin")} />
    </Button>
  )

  return tooltip || keystroke
    ? withTooltip(Component, tooltip, keystroke)
    : Component
}

function withTooltip(
  WrappedComponent: React.ReactNode,
  tooltip?: string,
  keystroke?: string
) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{WrappedComponent}</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent className="flex space-x-1.5">
          <div>{tooltip}</div>
          {keystroke ? <Kbd>{keystroke}</Kbd> : null}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
