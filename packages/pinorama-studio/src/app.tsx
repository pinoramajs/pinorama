// import { Outlet, createRootRoute } from "@tanstack/react-router"
import { TitleBar } from "./components/title-bar/title-bar"
import { LogExplorer } from "./features/log-explorer/components/log-explorer"

// export const rootRoute = createRootRoute({
//   component: App,
//   notFoundComponent: () => <div>Not found</div>
// })

export default function App() {
  return (
    <div className="h-screen w-full grid grid-rows-[48px_1fr]">
      <TitleBar />
      <LogExplorer />
    </div>
  )
}
