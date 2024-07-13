import { useTheme } from "@/contexts"
import { MoonStar, Sun } from "lucide-react"
import { Button } from "../ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "../ui/tooltip"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const Icon = theme === "dark" ? MoonStar : Sun
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
