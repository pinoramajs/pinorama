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
      <TooltipTrigger>
        <Button
          aria-label={ariaLabel}
          variant={"outline2"}
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
