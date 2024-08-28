import type { Feature } from "@/types"
import { LogExplorer } from "./components/log-explorer"

export default {
  routePath: "/",
  component: LogExplorer,
  messages: {
    en: () => import("./messages/en.json"),
    it: () => import("./messages/it.json")
  }
} as Feature
