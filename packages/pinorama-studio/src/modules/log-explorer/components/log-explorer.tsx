import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState
} from "react"

import { usePinoramaConnection } from "@/hooks"
import { UnplugIcon } from "lucide-react"
import { useIntl } from "react-intl"

import { EmptyStateBlock } from "@/components/empty-state"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { type ImperativeLogDetailsHandle, LogDetails } from "./log-details"
import { LogFilters } from "./log-filters"
import { type ImperativeLogViewerHandle, LogViewer } from "./log-viewer"

import { useAppConfig } from "@/contexts"
import type { AnyOrama } from "@orama/orama"
import type { PinoramaDocument } from "pinorama-types"
import type { ImperativePanelHandle } from "react-resizable-panels"
import type { SearchFilters } from "./log-filters/types"
import { StatusBar } from "./status-bar/status-bar"

const PANEL_SIZES = {
  filters: { base: 20, min: 10 },
  details: { base: 25, min: 25 }
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

export const LogExplorer = forwardRef<ImperativeLogExplorerHandle>(
  function LogExplorer(_props, ref) {
    const intl = useIntl()
    const appConfig = useAppConfig()

    const [liveModeAt, setLiveModeAt] = useState(() =>
      appConfig?.config.liveMode ? new Date() : null
    )

    const { isConnected, toggleConnection, introspection } =
      usePinoramaConnection()

    const [filters, setFilters] = useState<SearchFilters>({})
    const [searchText, setSearchText] = useState<string>("")
    const [selectedRow, setSelectedRow] =
      useState<PinoramaDocument<AnyOrama> | null>(null)

    const [detailsPanelCollapsed, setDetailsPanelCollapsed] = useState(true)
    const [filtersPanelCollapsed, setFiltersPanelCollapsed] = useState(true)

    const filtersPanelRef = useRef<ImperativePanelHandle | null>(null)
    const detailsPanelRef = useRef<ImperativePanelHandle | null>(null)

    const viewerRef = useRef<ImperativeLogViewerHandle | null>(null)
    const detailsRef = useRef<ImperativeLogDetailsHandle | null>(null)

    const showFilters = useCallback(() => {
      const panel = filtersPanelRef.current

      if (panel?.isCollapsed()) {
        panel?.expand(PANEL_SIZES.filters.base)
      } else {
        panel?.collapse()
      }
    }, [])

    const showDetails = useCallback(() => {
      const panel = detailsPanelRef.current

      if (panel?.isCollapsed()) {
        panel?.expand(PANEL_SIZES.details.base)
      } else {
        panel?.collapse()
      }
    }, [])

    const maximizeDetails = useCallback(() => {
      if (detailsPanelRef.current?.getSize() !== 100) {
        detailsPanelRef.current?.resize(100)
      } else {
        detailsPanelRef.current?.resize(PANEL_SIZES.details.base)
      }
    }, [])

    const incrementDetailsSize = useCallback(() => {
      detailsPanelRef.current?.resize(detailsPanelRef.current?.getSize() + 1)
    }, [])

    const decrementDetailsSize = useCallback(() => {
      detailsPanelRef.current?.resize(detailsPanelRef.current?.getSize() - 1)
    }, [])

    const incrementFiltersSize = useCallback(() => {
      filtersPanelRef.current?.resize(filtersPanelRef.current?.getSize() + 1)
    }, [])

    const decrementFiltersSize = useCallback(() => {
      filtersPanelRef.current?.resize(filtersPanelRef.current?.getSize() - 1)
    }, [])

    const changeSelectedRow = useCallback(
      (row: PinoramaDocument<AnyOrama> | null) => {
        setSelectedRow(row)
        if (!selectedRow && row) {
          detailsPanelRef.current?.expand(PANEL_SIZES.details.base)
        }
      },
      [selectedRow]
    )

    const clearFilters = useCallback(() => {
      // viewerRef.current?.resetLiveMode()
      setSearchText("")
      setFilters({})
    }, [])

    const handleSearchTextChange = useCallback((text: string) => {
      // viewerRef.current?.resetLiveMode()
      setSearchText(text)
    }, [])

    const handleFiltersChange = useCallback((filters: SearchFilters) => {
      // viewerRef.current?.resetLiveMode()
      setFilters(filters)
    }, [])

    const handleToggleLiveMode = useCallback(() => {
      clearFilters()

      if (liveModeAt) {
        setLiveModeAt(null)
      } else {
        const newLiveModeAt = new Date()
        setLiveModeAt(newLiveModeAt)
        viewerRef.current?.startLiveMode(newLiveModeAt)
      }
    }, [clearFilters, liveModeAt])

    useImperativeHandle(
      ref,
      () => ({
        showFilters,
        showDetails,
        maximizeDetails,
        clearFilters,
        copyToClipboard: () => {
          detailsRef.current?.copyToClipboard()
        },
        liveMode: () => handleToggleLiveMode(),
        refresh: () => viewerRef.current?.refresh(),
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
      }),
      [
        showFilters,
        showDetails,
        maximizeDetails,
        clearFilters,
        incrementFiltersSize,
        decrementFiltersSize,
        incrementDetailsSize,
        decrementDetailsSize,
        handleToggleLiveMode
      ]
    )

    if (!isConnected) {
      return (
        <EmptyStateBlock
          icon={UnplugIcon}
          title={intl.formatMessage({ id: "logExplorer.notConnected.title" })}
          message={intl.formatMessage({
            id: "logExplorer.notConnected.message"
          })}
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
      <div className="flex flex-col h-full overflow-auto">
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
              liveModeAt={liveModeAt}
              onFiltersChange={handleFiltersChange}
            />
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className={filtersPanelCollapsed ? "hidden" : undefined}
          />

          {/* Viewer */}
          <ResizablePanel order={2} className="bg-muted/20">
            <LogViewer
              ref={viewerRef}
              introspection={introspection}
              term={searchText}
              filters={filters}
              liveModeAt={liveModeAt}
              onLiveModeAtChange={setLiveModeAt}
              onSearchTextChange={handleSearchTextChange}
              onSelectedRowChange={changeSelectedRow}
              onToggleFiltersButtonClick={showFilters}
              onClearFiltersButtonClick={clearFilters}
              onToggleLiveButtonClick={handleToggleLiveMode}
              onToggleDetailsButtonClick={showDetails}
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
        <StatusBar />
      </div>
    )
  }
)
