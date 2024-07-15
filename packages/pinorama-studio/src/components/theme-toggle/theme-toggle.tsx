import { THEME, useTheme } from "@/contexts"
import { MoonStar, Sun } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"
import { Button } from "../ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "../ui/tooltip"

import style from "./theme-toggle.module.css"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const intl = useIntl()

  const handleClick = () => {
    setTheme(theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT)
  }

  const Icon = theme === THEME.DARK ? MoonStar : Sun

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={intl.formatMessage({ id: `mode.${theme}` })}
          variant="secondary"
          size="sm"
          onClick={handleClick}
        >
          <Icon className={style.icon} />
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
