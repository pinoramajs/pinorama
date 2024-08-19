import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { LoaderIcon, RefreshCwIcon } from "lucide-react"
import { useIntl } from "react-intl"

type RefreshDataButtonProps = {
  onClick: () => void
  loading?: boolean
}

export function RefreshDataButton(props: RefreshDataButtonProps) {
  const intl = useIntl()
  const label = intl.formatMessage({ id: "logExplorer.refreshData" })

  const Icon = props.loading ? LoaderIcon : RefreshCwIcon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          variant="outline2"
          className="px-2.5"
          onClick={props.onClick}
          disabled={props.loading}
        >
          <Icon
            className={cn("h-[18px] w-[18px]", props.loading && "animate-spin")}
          />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{label}</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
