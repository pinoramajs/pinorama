import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { FilterXIcon } from "lucide-react"
import { useIntl } from "react-intl"

type ClearFiltersButtonProps = {
  onClick: () => void
}

export function ClearFiltersButton(props: ClearFiltersButtonProps) {
  const intl = useIntl()
  const label = intl.formatMessage({ id: "logExplorer.clearFilters" })
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          variant="outline2"
          className="px-2.5"
          onClick={props.onClick}
        >
          <FilterXIcon className="h-[18px] w-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{label}</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
