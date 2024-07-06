import { Search } from "lucide-react"
import { useState } from "react"
import { PinoramaDocsTable } from "./components/pinorama-docs-table"
import { PinoramaFacets } from "./components/pinorama-facets"
import type { SearchFilters } from "./components/pinorama-facets/types"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "./components/ui/resizable"

function App() {
  const [searchText, setSearchText] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})

  const handleResetFilters = () => {
    setFilters({})
    setSearchText("")
  }

  const hasFilters = Object.keys(filters).length > 0 || searchText.length > 0

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
      <ResizablePanel defaultSize={20}>
        <div className="flex flex-col h-screen p-3 overflow-auto">
          <div className="flex text-sm whitespace-nowrap justify-between items-center mb-0.5 h-[40px]">
            <div className="font-medium">🌀 Pinorama</div>
            {hasFilters ? (
              <Button
                variant="outline"
                className="text-muted-foreground"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            ) : null}
          </div>
          <PinoramaFacets
            searchText={searchText}
            filters={filters}
            onFiltersChange={setFilters}
          />
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
          <PinoramaDocsTable searchText={searchText} filters={filters} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default App
