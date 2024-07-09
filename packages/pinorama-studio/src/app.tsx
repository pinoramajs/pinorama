import { LogExplorer } from "./components/log-explorer"
import { TitleBar } from "./components/title-bar/title-bar"

function App() {
  return (
    <div className="h-screen w-full grid grid-rows-[40px_1fr]">
      <TitleBar />
      <LogExplorer />
    </div>
  )
}

export default App
