import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { FilterIcon } from "lucide-react"
import { useIntl } from "react-intl"

type ToggleFiltersButtonProps = {
  onClick: () => void
}

export function ToggleFiltersButton(props: ToggleFiltersButtonProps) {
  const intl = useIntl()
  const label = intl.formatMessage({ id: "logExplorer.showOrHideFilters" })
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          variant="outline2"
          className="px-2.5"
          onClick={props.onClick}
        >
          <FilterIcon className="h-[18px] w-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{label}</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
