import type { AnySchema } from "@orama/orama"
import {
  getCoreRowModel,
  type RowSelectionState,
  useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { PinoramaIntrospection } from "pinorama-types"
import {
  forwardRef,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react"
import { useIntl } from "react-intl"
import { EmptyStateInline } from "@/components/empty-state/empty-state"
import { ErrorState } from "@/components/error-state/error-state"
import { LoadingState } from "@/components/loading-state/loading-state"
import type { SearchFilters } from "../log-filters/types"
import { LogViewerHeader } from "./components/header/header"
import { TableBody } from "./components/tbody"
import { TableHead } from "./components/thead"
import { useLiveLogs } from "./hooks/use-live-logs"
import { useStaticLogs } from "./hooks/use-static-logs"
import * as utils from "./utils"

type LogViewerProps = {
  introspection: PinoramaIntrospection<AnySchema>
  filters: SearchFilters
  searchText: string
  liveMode: boolean
  onSearchTextChange: (searchText: string) => void
  onSelectedRowChange: (row: any) => void
  onToggleFiltersButtonClick: () => void
  onClearFiltersButtonClick: () => void
  onToggleLiveButtonClick: (live: boolean) => void
  onToggleDetailsButtonClick: () => void
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

export const LogViewer = forwardRef(function LogViewer(
  props: LogViewerProps,
  ref: Ref<ImperativeLogViewerHandle>
) {
  const intl = useIntl()

  const staticLogsQuery = useStaticLogs(
    props.searchText,
    props.filters,
    !props.liveMode
  )

  const liveLogsQuery = useLiveLogs(
    props.searchText,
    props.filters,
    props.liveMode
  )

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
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
    props.searchText.length > 0 && Object.keys(props.filters).length > 0

  // biome-ignore lint: I need to update the selected row on row selection change
  useEffect(() => {
    const rowModel = table.getSelectedRowModel()
    const original = rowModel.rows[0]?.original
    props.onSelectedRowChange(original)
  }, [table.getSelectedRowModel()])

  // biome-ignore lint: I need to reset row selection on filters change
  useEffect(() => {
    clearSelection()
  }, [props.filters, props.searchText])

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
    shouldAutoScrollRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [])

  useEffect(() => {
    if (props.liveMode) {
      shouldAutoScrollRef.current = true
    }
  }, [props.liveMode])

  useEffect(() => {
    if (props.liveMode && shouldAutoScrollRef.current && rows.length > 0) {
      virtualizer.scrollToIndex(rows.length - 1, { align: "end" })
    }
  }, [props.liveMode, rows.length, virtualizer])

  useImperativeHandle(
    ref,
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
    [logsQuery.refetch, clearSelection, table, logsQuery, virtualizer]
  )

  const isLoading = logsQuery.status === "pending"
  const hasError = logsQuery.status === "error"
  const hasNoData = logsQuery.data?.length === 0 || false

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
        onRefreshButtonClick={logsQuery.refetch}
        onToggleDetailsButtonClick={props.onToggleDetailsButtonClick}
      />

      <div
        className="w-full h-full relative overflow-auto"
        ref={tableContainerRef}
        onScroll={handleScroll}
      >
        <table className="text-xs w-full">
          <TableHead table={table} />
          {isLoading || hasNoData || hasError ? (
            <tbody className="relative">
              <tr>
                <td className="text-muted-foreground">
                  {isLoading ? (
                    <LoadingState />
                  ) : hasError ? (
                    <ErrorState error={logsQuery.error} />
                  ) : hasNoData ? (
                    <EmptyStateInline
                      message={intl.formatMessage({
                        id: "logExplorer.noLogsFound"
                      })}
                    />
                  ) : null}
                </td>
              </tr>
            </tbody>
          ) : (
            <TableBody virtualizer={virtualizer} rows={rows} />
          )}
        </table>
      </div>
    </div>
  )
})
