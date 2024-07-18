import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useTheme } from "@/contexts"
import { MoonStarIcon, SunIcon } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"

export function ThemeToggleButton() {
  const intl = useIntl()
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const Icon = theme === "dark" ? MoonStarIcon : SunIcon

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
