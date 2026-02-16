import { Plug01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { AnyOrama } from "@orama/orama"
import { useQueryClient } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import type { PinoramaDocument } from "pinorama-types"
import { useImperativeHandle, useRef, useState } from "react"
import { useIntl } from "react-intl"
import type { PanelImperativeHandle } from "react-resizable-panels"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { usePinoramaConnection } from "@/hooks"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { liveModeParam } from "@/lib/search-params"
import { type ImperativeLogDetailsHandle, LogDetails } from "./log-details"
import { LogFilters } from "./log-filters"
import type { SearchFilters } from "./log-filters/types"
import {
  type ImperativeLogViewerHandle,
  LogViewer,
  type LogViewerStatus
} from "./log-viewer"
import { StatusBar } from "./log-viewer/components/status-bar"
import { useStats } from "./log-viewer/hooks/use-stats"

const PANEL_SIZES = {
  filters: { base: "20", min: 200 },
  details: { base: "25", min: 200 }
}

export type ImperativeLogExplorerHandle = {
  showFilters: () => void
  showDetails: () => void
  maximizeDetails: () => void
  clearFilters: () => void
  liveMode: () => void
  refresh: () => void
  focusSearch: () => void
  selectNextRow: () => void
  selectPreviousRow: () => void
  copyToClipboard: () => void
  clearSelection: () => void
  incrementFiltersSize: () => void
  decrementFiltersSize: () => void
  incrementDetailsSize: () => void
  decrementDetailsSize: () => void
}

export function LogExplorer({
  ref
}: {
  ref?: React.Ref<ImperativeLogExplorerHandle>
}) {
  const intl = useIntl()

  const { isConnected, toggleConnection, introspection } =
    usePinoramaConnection()

  const [liveMode, setLiveMode] = useQueryState("liveMode", liveModeParam)
  const [liveSessionStart, setLiveSessionStart] = useState(0)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [searchText, setSearchText] = useState<string>("")
  const debouncedSearchText = useDebouncedValue(searchText)
  const [selectedRow, setSelectedRow] =
    useState<PinoramaDocument<AnyOrama> | null>(null)

  const [viewerStatus, setViewerStatus] = useState<LogViewerStatus | null>(null)
  const [detailsPanelCollapsed, setDetailsPanelCollapsed] = useState(true)
  const [filtersPanelCollapsed, setFiltersPanelCollapsed] = useState(true)

  const statsQuery = useStats()
  const isDbEmpty = (statsQuery.data?.totalDocs ?? 0) === 0

  const queryClient = useQueryClient()

  const clearLogs = () => {
    setSelectedRow(null)
    setFilters({})
    setSearchText("")
    setLiveSessionStart(Date.now())
    queryClient.invalidateQueries({ queryKey: ["stats"] })
  }

  const filtersPanelRef = useRef<PanelImperativeHandle | null>(null)
  const detailsPanelRef = useRef<PanelImperativeHandle | null>(null)

  const viewerRef = useRef<ImperativeLogViewerHandle | null>(null)
  const detailsRef = useRef<ImperativeLogDetailsHandle | null>(null)

  const showFilters = () => {
    const panel = filtersPanelRef.current

    if (panel?.isCollapsed()) {
      panel?.resize(PANEL_SIZES.filters.base)
    } else {
      panel?.collapse()
    }
  }

  const showDetails = () => {
    const panel = detailsPanelRef.current

    if (panel?.isCollapsed()) {
      panel?.resize(PANEL_SIZES.details.base)
    } else {
      panel?.collapse()
    }
  }

  const maximizeDetails = () => {
    if (detailsPanelRef.current?.getSize().asPercentage !== 100) {
      detailsPanelRef.current?.resize("100")
    } else {
      detailsPanelRef.current?.resize(PANEL_SIZES.details.base)
    }
  }

  const incrementDetailsSize = () => {
    const size = detailsPanelRef.current?.getSize().asPercentage ?? 0
    detailsPanelRef.current?.resize(`${size + 1}`)
  }

  const decrementDetailsSize = () => {
    const size = detailsPanelRef.current?.getSize().asPercentage ?? 0
    detailsPanelRef.current?.resize(`${size - 1}`)
  }

  const incrementFiltersSize = () => {
    const size = filtersPanelRef.current?.getSize().asPercentage ?? 0
    filtersPanelRef.current?.resize(`${size + 1}`)
  }

  const decrementFiltersSize = () => {
    const size = filtersPanelRef.current?.getSize().asPercentage ?? 0
    filtersPanelRef.current?.resize(`${size - 1}`)
  }

  const clearFilters = () => {
    setSearchText("")
    setFilters({})
  }

  const toggleLiveMode = (value: boolean) => {
    setLiveMode(value)
    if (value) {
      clearFilters()
      setLiveSessionStart(Date.now())
    }
    queryClient.invalidateQueries({ queryKey: ["stats"] })
  }

  const handleRefresh = () => {
    viewerRef.current?.refresh()
    queryClient.invalidateQueries({
      predicate: (query) =>
        ["stats", "facets", "static-logs"].includes(query.queryKey[0] as string)
    })
  }

  const changeSelectedRow = (row: PinoramaDocument<AnyOrama> | null) => {
    setSelectedRow(row)
    if (row && detailsPanelRef.current?.isCollapsed()) {
      detailsPanelRef.current?.resize(PANEL_SIZES.details.base)
    }
  }

  useImperativeHandle(ref, () => ({
    showFilters,
    showDetails,
    maximizeDetails,
    clearFilters,
    copyToClipboard: () => {
      detailsRef.current?.copyToClipboard()
    },
    liveMode: () => toggleLiveMode(!liveMode),
    refresh: handleRefresh,
    focusSearch: () => viewerRef.current?.focusSearch(),
    selectNextRow: () => viewerRef.current?.selectNextRow(),
    selectPreviousRow: () => viewerRef.current?.selectPreviousRow(),
    incrementFiltersSize,
    decrementFiltersSize,
    incrementDetailsSize,
    decrementDetailsSize,
    clearSelection: () => {
      viewerRef.current?.clearSelection()
    }
  }))

  if (!isConnected) {
    return (
      <Empty>
        <EmptyHeader className="max-w-[250px]">
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Plug01Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>
            {intl.formatMessage({ id: "logExplorer.notConnected.title" })}
          </EmptyTitle>
          <EmptyDescription>
            {intl.formatMessage({
              id: "logExplorer.notConnected.message"
            })}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" onClick={toggleConnection}>
            {intl.formatMessage({
              id: "logExplorer.notConnected.action"
            })}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!introspection) {
    return null
  }

  return (
    <div className="grid grid-rows-[1fr_auto] h-full overflow-hidden">
      <ResizablePanelGroup orientation="horizontal">
        {/* Filters */}
        <ResizablePanel
          panelRef={filtersPanelRef}
          collapsible
          minSize={PANEL_SIZES.filters.min}
          defaultSize={0}
          onResize={(size) => setFiltersPanelCollapsed(size.asPercentage === 0)}
        >
          <LogFilters
            introspection={introspection}
            searchText={debouncedSearchText}
            filters={filters}
            liveMode={liveMode}
            liveSessionStart={liveSessionStart}
            isDbEmpty={isDbEmpty}
            onFiltersChange={setFilters}
          />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={filtersPanelCollapsed ? "hidden" : undefined}
        />

        {/* Viewer */}
        <ResizablePanel className="bg-muted/20">
          <LogViewer
            ref={viewerRef}
            introspection={introspection}
            searchText={searchText}
            debouncedSearchText={debouncedSearchText}
            filters={filters}
            liveMode={liveMode}
            liveSessionStart={liveSessionStart}
            dbTotalDocs={statsQuery.data?.totalDocs ?? 0}
            onSearchTextChange={setSearchText}
            onSelectedRowChange={changeSelectedRow}
            onToggleFiltersButtonClick={showFilters}
            onClearFiltersButtonClick={clearFilters}
            onRefreshButtonClick={handleRefresh}
            onToggleLiveButtonClick={toggleLiveMode}
            onClearLogsButtonClick={clearLogs}
            onToggleDetailsButtonClick={showDetails}
            onStatusChange={setViewerStatus}
            searchProperties={introspection.searchProperties}
          />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={detailsPanelCollapsed ? "hidden" : undefined}
        />

        {/* Details */}
        <ResizablePanel
          panelRef={detailsPanelRef}
          collapsible
          minSize={PANEL_SIZES.details.min}
          defaultSize={0}
          onResize={(size) => setDetailsPanelCollapsed(size.asPercentage === 0)}
        >
          <LogDetails
            ref={detailsRef}
            data={selectedRow}
            onMaximize={maximizeDetails}
            onNext={() => viewerRef.current?.selectNextRow()}
            onPrevious={() => viewerRef.current?.selectPreviousRow()}
            onClose={() => detailsPanelRef.current?.collapse()}
            canNext={viewerRef.current?.canSelectNextRow()}
            canPrevious={viewerRef.current?.canSelectPreviousRow()}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {viewerStatus && (
        <StatusBar
          liveMode={liveMode}
          page={viewerStatus.page}
          pageSize={viewerStatus.pageSize}
          totalCount={viewerStatus.totalCount}
          bufferCount={viewerStatus.bufferCount}
          bufferMax={viewerStatus.bufferMax}
          stats={statsQuery.data}
          onPageChange={viewerStatus.onPageChange}
          onPageSizeChange={viewerStatus.onPageSizeChange}
        />
      )}
    </div>
  )
}
