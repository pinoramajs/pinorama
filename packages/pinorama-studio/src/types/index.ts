import type { ImportMessages } from "@/i18n"
import type React from "react"

export type Feature = {
  id: string
  routePath: string
  component: React.ComponentType
  messages?: ImportMessages
}
