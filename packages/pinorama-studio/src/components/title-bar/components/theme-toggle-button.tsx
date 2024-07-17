import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { THEME, useTheme } from "@/contexts"
import { MoonStarIcon, SunIcon } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"

export function ThemeToggleButton() {
  const intl = useIntl()
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    setTheme(theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT)
  }

  const Icon = theme === THEME.DARK ? MoonStarIcon : SunIcon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={intl.formatMessage({ id: `mode.${theme}` })}
          variant="secondary"
          size="sm"
          onClick={handleClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>
          <FormattedMessage id={`mode.${theme}`} />
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
