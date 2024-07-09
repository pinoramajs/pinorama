import { useCallback, useEffect, useRef, useState } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "../ui/resizable"
import { LogDetails } from "./components/log-details"
import { LogFilters } from "./components/log-filters"
import { LogViewer } from "./components/log-viewer"

import type { ImperativePanelHandle } from "react-resizable-panels"
import type { SearchFilters } from "./components/log-filters/types"

export function LogExplorer() {
  const filtersPanelRef = useRef<ImperativePanelHandle | null>(null)
  const detailsPanelRef = useRef<ImperativePanelHandle | null>(null)

  const [searchText, setSearchText] = useState<string>("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [rowSelection, setRowSelection] = useState(null)

  const handleFilterPanelToggle = useCallback(() => {
    const panel = filtersPanelRef.current
    const method = panel?.isCollapsed() ? "expand" : "collapse"
    panel?.[method]()
  }, [])

  useEffect(() => {
    const panel = detailsPanelRef.current
    rowSelection ? panel?.expand(20) : panel?.collapse()
  }, [rowSelection])

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel ref={filtersPanelRef} defaultSize={20} collapsible>
        <LogFilters
          searchText={searchText}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80} className="bg-muted/20">
        <LogViewer
          searchText={searchText}
          filters={filters}
          onSearchTextChange={setSearchText}
          onRowSelectionChange={setRowSelection}
          onFiltersPanelToggle={handleFilterPanelToggle}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel ref={detailsPanelRef} defaultSize={0} collapsible>
        <LogDetails data={rowSelection} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
