import { TitleBar } from "./components/title-bar/title-bar"
import { LogExplorer } from "./features/log-explorer"

function App() {
  return (
    <div className="h-screen w-full grid grid-rows-[48px_1fr]">
      <TitleBar />
      <LogExplorer />
    </div>
  )
}

export default App
