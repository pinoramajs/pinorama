import { createModule } from "@/lib/modules"
import { LogExplorer } from "./components/log-explorer"

export default createModule({
  id: "logExplorer",
  component: LogExplorer,
  routePath: "/",
  messages: {
    en: () => import("./messages/en.json"),
    it: () => import("./messages/it.json")
  },
  hotkeys: {
    focusSearch: "slash",
    showFilters: "f",
    showDetails: "o",
    maximizeDetails: "m",
    liveMode: "l",
    refresh: "r",
    clearFilters: "x",
    selectNextRow: "j, down",
    selectPreviousRow: "k, up",
    copyToClipboard: "y, c",
    incrementFiltersSize: "shift+f",
    decrementFiltersSize: "shift+d",
    incrementDetailsSize: "shift+j",
    decrementDetailsSize: "shift+k",
    clearSelection: "esc"
  }
} as const)
