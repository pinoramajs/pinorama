import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { SlidersVerticalIcon } from "lucide-react"

type ToggleFiltersButtonProps = {
  onClick: () => void
}

export function ToggleFiltersButton(props: ToggleFiltersButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={"Show or Hide Filters"}
          variant="outline2"
          className="px-2.5"
          onClick={props.onClick}
        >
          <SlidersVerticalIcon className="h-[18px] w-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Show or Hide Filters</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
