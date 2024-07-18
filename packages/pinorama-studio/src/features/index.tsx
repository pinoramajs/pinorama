import type { Feature } from "@/types"
import LogExplorerFeature from "./log-explorer"

export default [
  LogExplorerFeature,
  {
    routePath: "/feature2",
    component: () => (
      <div className="h-full w-full flex items-center justify-center">
        Welcome to Feature 2! 🎉
      </div>
    )
  }
] as Feature[]
