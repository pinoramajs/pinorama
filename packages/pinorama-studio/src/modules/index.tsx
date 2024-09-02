import type { Module } from "@/lib/modules"
import LogExplorerModule from "./log-explorer"

const modules: Module<any>[] = [
  LogExplorerModule,
  {
    id: "feature-fake",
    routePath: "/feature2",
    component: () => (
      <div className="h-full w-full flex items-center justify-center">
        Welcome to Feature 2! 🎉
      </div>
    )
  }
]

export default modules
