import { useTheme } from "@/contexts"
import { MoonStar, Sun } from "lucide-react"
import { Button } from "../ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleClick = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const Icon = theme === "dark" ? MoonStar : Sun

  return (
    <Button size={"sm"} variant={"outline2"} onClick={handleClick}>
      <Icon className="h-4 w-4" />
    </Button>
  )
}
