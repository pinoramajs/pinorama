import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { FilterXIcon } from "lucide-react"

type ClearFiltersButtonProps = {
  onClick: () => void
}

export function ClearFiltersButton(props: ClearFiltersButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={"Clear search text and filters"}
          variant="outline2"
          className="px-2.5"
          onClick={props.onClick}
        >
          <FilterXIcon className="h-[18px] w-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Clear search text and filters</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
