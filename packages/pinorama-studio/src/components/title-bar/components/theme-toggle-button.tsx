import { MoonStarIcon, SunIcon } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Theme, useTheme } from "@/contexts"

export function ThemeToggleButton() {
  const intl = useIntl()
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light)
  }

  const Icon = theme === Theme.Dark ? MoonStarIcon : SunIcon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={intl.formatMessage({ id: `theme.${theme}` })}
          variant="secondary"
          size="sm"
          onClick={handleClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>
          <FormattedMessage id={`theme.${theme}`} />
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
