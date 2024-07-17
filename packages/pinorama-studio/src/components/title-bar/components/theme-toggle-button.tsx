import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useTheme } from "@/contexts"
import { MoonStarIcon, SunIcon } from "lucide-react"

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const Icon = theme === "dark" ? MoonStarIcon : SunIcon
  const ariaLabel = theme === "dark" ? "Dark Mode" : "Light Mode"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={ariaLabel}
          variant={"secondary"}
          size={"sm"}
          onClick={handleClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>{ariaLabel}</TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}
