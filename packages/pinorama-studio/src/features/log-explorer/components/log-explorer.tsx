import { useCallback, useEffect, useRef, useState } from "react"

import { usePinoramaConnection } from "@/hooks"
import { UnplugIcon } from "lucide-react"
import { useIntl } from "react-intl"

import { EmptyStateBlock } from "@/components/empty-state"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { LogDetails } from "./log-details"
import { LogFilters } from "./log-filters"
import { LogViewer } from "./log-viewer"

import { useAppConfig } from "@/contexts"
import type { ImperativePanelHandle } from "react-resizable-panels"
import type { SearchFilters } from "./log-filters/types"

const PANEL_SIZES = {
  filters: { base: 20, min: 10 },
  details: { base: 20, min: 10 }
}

export function LogExplorer() {
  const intl = useIntl()
  const appConfig = useAppConfig()

  const { isConnected, toggleConnection, introspection } =
    usePinoramaConnection()

  const [liveMode, setLiveMode] = useState<boolean | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchText, setSearchText] = useState<string>("")
  const [selectedRow, setSelectedRow] = useState(null)

  const [detailsPanelCollapsed, setDetailsPanelCollapsed] = useState(true)
  const [filtersPanelCollapsed, setFiltersPanelCollapsed] = useState(true)

  const filtersPanelRef = useRef<ImperativePanelHandle | null>(null)
  const detailsPanelRef = useRef<ImperativePanelHandle | null>(null)

  const isLiveModeEnabled = liveMode ?? appConfig?.config.liveMode ?? false

  const toggleFiltersPanel = useCallback(() => {
    const panel = filtersPanelRef.current

    if (panel?.isCollapsed()) {
      panel?.expand(PANEL_SIZES.filters.base)
    } else {
      panel?.collapse()
    }
  }, [])

  const clearFilters = useCallback(() => {
    setSearchText("")
    setFilters({})
  }, [])

  useEffect(() => {
    const panel = detailsPanelRef.current
    selectedRow ? panel?.expand(PANEL_SIZES.details.base) : panel?.collapse()
  }, [selectedRow])

  if (!isConnected) {
    return (
      <EmptyStateBlock
        icon={UnplugIcon}
        title={intl.formatMessage({ id: "logExplorer.notConnected.title" })}
        message={intl.formatMessage({ id: "logExplorer.notConnected.message" })}
        buttons={[
          {
            text: intl.formatMessage({
              id: "logExplorer.notConnected.action"
            }),
            onClick: toggleConnection
          }
        ]}
      />
    )
  }

  if (!introspection) {
    return null
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* Filters */}
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
          introspection={introspection}
          searchText={searchText}
          filters={filters}
          liveMode={isLiveModeEnabled}
          onFiltersChange={setFilters}
        />
      </ResizablePanel>
      <ResizableHandle
        withHandle
        className={filtersPanelCollapsed ? "hidden" : undefined}
      />

      {/* Viewer */}
      <ResizablePanel order={2} className="bg-muted/20">
        <LogViewer
          introspection={introspection}
          searchText={searchText}
          filters={filters}
          liveMode={isLiveModeEnabled}
          onSearchTextChange={setSearchText}
          onSelectedRowChange={setSelectedRow}
          onToggleFiltersButtonClick={toggleFiltersPanel}
          onClearFiltersButtonClick={clearFilters}
          onToggleLiveButtonClick={setLiveMode}
        />
      </ResizablePanel>
      <ResizableHandle
        withHandle
        className={detailsPanelCollapsed ? "hidden" : undefined}
      />

      {/* Details */}
      <ResizablePanel
        ref={detailsPanelRef}
        collapsible
        order={3}
        minSize={PANEL_SIZES.details.min}
        defaultSize={0}
        onCollapse={() => setDetailsPanelCollapsed(true)}
        onExpand={() => setDetailsPanelCollapsed(false)}
      >
        <LogDetails data={selectedRow} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
