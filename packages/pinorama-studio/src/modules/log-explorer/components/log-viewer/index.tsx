import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { AnySchema } from "@orama/orama"
import {
  getCoreRowModel,
  type RowSelectionState,
  useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { PinoramaIntrospection } from "pinorama-types"
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react"
import { useIntl } from "react-intl"
import { InlineStatus } from "@/components/inline-status"
import { Button } from "@/components/ui/button"
import { DEFAULT_PAGE_SIZE } from "@/modules/log-explorer/constants"
import type { SearchFilters } from "../log-filters/types"
import { LogViewerHeader } from "./components/header/header"
import { TableBody } from "./components/tbody"
import { TableHead } from "./components/thead"
import { useLiveLogs } from "./hooks/use-live-logs"
import { useStaticLogs } from "./hooks/use-static-logs"
import * as utils from "./utils"

export type LogViewerStatus = {
  page: number
  pageSize: number
  totalCount: number
  bufferCount: number
  bufferMax: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

type LogViewerProps = {
  ref?: React.Ref<ImperativeLogViewerHandle>
  introspection: PinoramaIntrospection<AnySchema>
  filters: SearchFilters
  searchText: string
  debouncedSearchText: string
  liveMode: boolean
  liveSessionStart: number
  dbTotalDocs: number
  onSearchTextChange: (searchText: string) => void
  onSelectedRowChange: (row: any) => void
  onToggleFiltersButtonClick: () => void
  onClearFiltersButtonClick: () => void
  onToggleLiveButtonClick: (live: boolean) => void
  onRefreshButtonClick: () => void
  onClearLogsButtonClick: () => void
  onToggleDetailsButtonClick: () => void
  onStatusChange?: (status: LogViewerStatus) => void
}

export type ImperativeLogViewerHandle = {
  refresh: () => void
  focusSearch: () => void
  selectNextRow: () => void
  selectPreviousRow: () => void
  clearSelection: () => void
  canSelectNextRow: () => boolean
  canSelectPreviousRow: () => boolean
}

export function LogViewer(props: LogViewerProps) {
  "use no memo"
  const intl = useIntl()

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const staticLogsQuery = useStaticLogs(
    props.debouncedSearchText,
    props.filters,
    !props.liveMode,
    page,
    pageSize
  )

  const liveLogsQuery = useLiveLogs(
    props.debouncedSearchText,
    props.filters,
    props.liveMode,
    props.liveSessionStart
  )

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const shouldAutoScrollRef = useRef(true)

  const logsQuery = props.liveMode ? liveLogsQuery : staticLogsQuery
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data])

  const columnsConfig = useMemo(
    () => utils.getColumnsConfig(props.introspection),
    [props.introspection]
  )

  const table = useReactTable({
    data: logs,
    columns: columnsConfig.definition,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection
    },
    initialState: {
      columnVisibility: columnsConfig.visibility,
      columnSizing: columnsConfig.sizing
    }
  })

  const hasFilters =
    props.debouncedSearchText.length > 0 &&
    Object.keys(props.filters).length > 0

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally tracking row model reference changes
  useEffect(() => {
    const rowModel = table.getSelectedRowModel()
    const original = rowModel.rows[0]?.original
    props.onSelectedRowChange(original)
  }, [table.getSelectedRowModel()])

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset selection on filters change only
  useEffect(() => {
    clearSelection()
    setPage(0)
  }, [props.filters, props.debouncedSearchText])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(0)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: push status data to parent without re-triggering on callback change
  useEffect(() => {
    props.onStatusChange?.({
      page,
      pageSize,
      totalCount: staticLogsQuery.totalCount,
      bufferCount: liveLogsQuery.bufferCount,
      bufferMax: liveLogsQuery.bufferMax,
      onPageChange: setPage,
      onPageSizeChange: handlePageSizeChange
    })
  }, [
    page,
    pageSize,
    staticLogsQuery.totalCount,
    liveLogsQuery.bufferCount,
    liveLogsQuery.bufferMax,
    handlePageSizeChange
  ])

  const clearSelection = useCallback(() => {
    table.setRowSelection({})
  }, [table])

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 20
  })

  const handleScroll = useCallback(() => {
    const el = tableContainerRef.current
    if (!el) return
    const threshold = 50
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    shouldAutoScrollRef.current = isNearBottom
    setShowScrollToBottom(!isNearBottom)
  }, [])

  useEffect(() => {
    if (props.liveMode) {
      shouldAutoScrollRef.current = true
      setShowScrollToBottom(false)
    }
  }, [props.liveMode])

  useEffect(() => {
    if (props.liveMode && shouldAutoScrollRef.current && rows.length > 0) {
      virtualizer.scrollToIndex(rows.length - 1, { align: "end" })
    }
  }, [props.liveMode, rows.length, virtualizer])

  useImperativeHandle(
    props.ref,
    () => ({
      refresh: () => logsQuery.refetch(),
      focusSearch: () => searchInputRef.current?.focus(),
      selectNextRow: () => {
        const currentIndex = utils.getCurrentRowIndex(table)
        const nextIndex = currentIndex + 1
        if (utils.selectRowByIndex(nextIndex, table)) {
          utils.scrollRowIntoView(virtualizer, nextIndex)
        }
      },
      selectPreviousRow: () => {
        const currentIndex = utils.getCurrentRowIndex(table)
        const prevIndex = currentIndex - 1
        if (utils.selectRowByIndex(prevIndex, table)) {
          utils.scrollRowIntoView(virtualizer, prevIndex)
        }
      },
      clearSelection,
      canSelectNextRow: () => utils.canSelectNextRow(table),
      canSelectPreviousRow: () => utils.canSelectPreviousRow(table)
    }),
    [logsQuery, clearSelection, table, virtualizer]
  )

  const scrollToBottom = useCallback(() => {
    shouldAutoScrollRef.current = true
    setShowScrollToBottom(false)
    virtualizer.scrollToIndex(rows.length - 1, { align: "end" })
  }, [virtualizer, rows.length])

  const isLoading = logsQuery.status === "pending"
  const hasError = logsQuery.status === "error"
  const hasNoData = logsQuery.data?.length === 0
  const isDbEmpty = props.dbTotalDocs === 0

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <LogViewerHeader
        searchInputRef={searchInputRef}
        introspection={props.introspection}
        table={table}
        searchText={props.searchText}
        liveMode={props.liveMode}
        showClearFiltersButton={hasFilters}
        isLoading={logsQuery.isFetching}
        onSearchTextChange={props.onSearchTextChange}
        onToggleFiltersButtonClick={props.onToggleFiltersButtonClick}
        onToggleLiveButtonClick={props.onToggleLiveButtonClick}
        onClearFiltersButtonClick={props.onClearFiltersButtonClick}
        onRefreshButtonClick={props.onRefreshButtonClick}
        onClearLogsButtonClick={props.onClearLogsButtonClick}
        onToggleDetailsButtonClick={props.onToggleDetailsButtonClick}
      />

      <div className="relative flex-1 min-h-0">
        <div
          className="w-full h-full overflow-auto"
          ref={tableContainerRef}
          onScroll={handleScroll}
        >
          <table className="text-xs w-full">
            <TableHead table={table} />
            {isLoading || hasNoData || hasError ? (
              <tbody className="relative">
                <tr>
                  <td className="text-muted-foreground p-2">
                    {isLoading ? (
                      <InlineStatus variant="loading" />
                    ) : hasError ? (
                      <InlineStatus
                        variant="error"
                        error={logsQuery.error as Error}
                      />
                    ) : hasNoData ? (
                      <InlineStatus
                        variant="empty"
                        message={intl.formatMessage({
                          id: isDbEmpty
                            ? props.liveMode
                              ? "logExplorer.waitingForLogs"
                              : "logExplorer.noLogsYet"
                            : "logExplorer.noLogsMatch"
                        })}
                      />
                    ) : null}
                  </td>
                </tr>
              </tbody>
            ) : (
              <TableBody
                virtualizer={virtualizer}
                rows={rows}
                introspection={props.introspection}
              />
            )}
          </table>
        </div>
        {props.liveMode && showScrollToBottom && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-3 right-3 z-10 h-8 w-8 shadow-md"
            onClick={scrollToBottom}
            aria-label={intl.formatMessage({
              id: "logExplorer.scrollToBottom"
            })}
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="h-4 w-4"
            />
          </Button>
        )}
      </div>
    </div>
  )
}
