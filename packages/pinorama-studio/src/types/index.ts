import type { ImportMessages } from "@/i18n"
import type React from "react"

export type Feature = {
  routePath: string
  component: React.ComponentType
  messages?: ImportMessages
}
