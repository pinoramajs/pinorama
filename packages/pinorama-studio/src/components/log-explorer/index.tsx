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

const PANEL_SIZES = {
  filters: { base: 20, min: 10 },
  details: { base: 20, min: 10 }
}

export function LogExplorer(props: LogExplorerProps) {
  const [rowSelection, setRowSelection] = useState(null)

  const filtersPanelRef = useRef<ImperativePanelHandle | null>(null)
  const detailsPanelRef = useRef<ImperativePanelHandle | null>(null)

  const [detailsPanelCollapsed, setDetailsPanelCollapsed] = useState(true)
  const [filtersPanelCollapsed, setFiltersPanelCollapsed] = useState(true)

  const handleFiltersPanelToggle = useCallback(() => {
    const panel = filtersPanelRef.current

    if (panel?.isCollapsed()) {
      panel?.expand(PANEL_SIZES.filters.base)
    } else {
      panel?.collapse()
    }
  }, [])

  useEffect(() => {
    const panel = detailsPanelRef.current
    rowSelection ? panel?.expand(PANEL_SIZES.details.base) : panel?.collapse()
  }, [rowSelection])

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        ref={filtersPanelRef}
        collapsible
        order={1}
        minSize={PANEL_SIZES.filters.min}
        defaultSize={0}
        onCollapse={() => setFiltersPanelCollapsed(true)}
        onExpand={() => setFiltersPanelCollapsed(false)}
      >
        <LogFilters
          searchText={props.searchText}
          filters={props.filters}
          onFiltersChange={props.onFiltersChange}
        />
      </ResizablePanel>
      <ResizableHandle
        withHandle
        className={filtersPanelCollapsed ? "hidden" : ""}
      />
      <ResizablePanel order={2} className="bg-muted/20">
        <LogViewer
          searchText={props.searchText}
          filters={props.filters}
          onSearchTextChange={props.onSearchTextChange}
          onRowSelectionChange={setRowSelection}
          filtersPanelCollapsed={filtersPanelCollapsed}
          onFiltersPanelToggle={handleFiltersPanelToggle}
        />
      </ResizablePanel>
      <ResizableHandle
        withHandle
        className={detailsPanelCollapsed ? "hidden" : ""}
      />
      <ResizablePanel
        ref={detailsPanelRef}
        collapsible
        order={3}
        minSize={PANEL_SIZES.details.min}
        defaultSize={0}
        onCollapse={() => setDetailsPanelCollapsed(true)}
        onExpand={() => setDetailsPanelCollapsed(false)}
      >
        <LogDetails data={rowSelection} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
