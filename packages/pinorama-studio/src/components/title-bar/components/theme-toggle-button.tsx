import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { FormattedMessage, useIntl } from "react-intl"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Theme, useTheme } from "@/contexts"

export function ThemeToggleButton() {
  const intl = useIntl()
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light)
  }

  const icon = theme === Theme.Dark ? Moon02Icon : Sun01Icon

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={intl.formatMessage({ id: `theme.${theme}` })}
            variant="secondary"
            size="sm"
            onClick={handleClick}
          />
        }
      >
        <HugeiconsIcon icon={icon} strokeWidth={2} className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent>
        <FormattedMessage id={`theme.${theme}`} />
      </TooltipContent>
    </Tooltip>
  )
}
