import { Search } from "lucide-react"
import { PinoramaDocsTable } from "./components/pinorama-docs-table"
import { PinoramaFacets } from "./components/pinorama-facets"
import { Input } from "./components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "./components/ui/resizable"

function App() {
  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
      <ResizablePanel defaultSize={20}>
        <div className="flex flex-col h-screen p-3 overflow-auto">
          <div className="py-2 px-2 text-sm mt-1">🌀 Pinorama</div>
          <PinoramaFacets />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="flex flex-col h-screen bg-muted/20">
          <div className="p-3 pb-1 bg-background space-x-1">
            <div className="relative flex items-center">
              <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search logs..."
                className="pl-9"
              />
            </div>
          </div>
          <PinoramaDocsTable />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default App
