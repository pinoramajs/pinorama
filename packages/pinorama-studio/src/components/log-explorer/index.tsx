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

type LogExplorerProps = {
  searchText: string
  filters: SearchFilters
  onSearchTextChange: (searchText: string) => void
  onFiltersChange: (filters: SearchFilters) => void
}

export function LogExplorer(props: LogExplorerProps) {
  const filtersPanelRef = useRef<ImperativePanelHandle | null>(null)
  const detailsPanelRef = useRef<ImperativePanelHandle | null>(null)

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
          searchText={props.searchText}
          filters={props.filters}
          onFiltersChange={props.onFiltersChange}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80} className="bg-muted/20">
        <LogViewer
          searchText={props.searchText}
          filters={props.filters}
          onSearchTextChange={props.onSearchTextChange}
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
