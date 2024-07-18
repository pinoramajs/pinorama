import type { Feature } from "@/types"
import { LogExplorer } from "./components/log-explorer"

export default {
  id: "log-explorer-feature",
  route: "/log-explorer",
  component: LogExplorer,
  messages: {
    en: () => import("./messages/en.json"),
    it: () => import("./messages/it.json")
  }
} as unknown as Feature // FIX: delete unknown
