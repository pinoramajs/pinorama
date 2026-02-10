import { KeyboardIcon } from "lucide-react"
import { FormattedMessage } from "react-intl"
import { Kbd } from "@/components/kbd/kbd"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useAllModuleHotkeys } from "@/hooks/use-module-hotkeys"

export function HotkeysButton() {
  const hotkeys = useAllModuleHotkeys()

  const handleClick = () => {}

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger>
          <DialogTrigger asChild>
            <Button
              aria-label={"Settings"}
              variant={"secondary"}
              size={"sm"}
              onClick={handleClick}
            >
              <KeyboardIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            <FormattedMessage id="labels.keyboardShortcuts" />
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id="labels.keyboardShortcuts" />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage id="labels.allShortcutsSeparatedByModule" />
          </DialogDescription>
        </DialogHeader>
        {Object.entries(hotkeys).map(([module, hotkeys]) => (
          <div key={module}>
            <div className="text-sm font-semibold py-2">{module}</div>
            <ul className="space-y-2">
              {hotkeys.map((hotkey) => (
                <li
                  key={hotkey.keystroke}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground text-sm">
                    {hotkey.description}
                  </span>
                  <Kbd>{hotkey.keystroke}</Kbd>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  )
}
