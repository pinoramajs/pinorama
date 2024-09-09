import {
  type Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react"

import { EmptyStateInline } from "@/components/empty-state/empty-state"
import { ErrorState } from "@/components/error-state/error-state"
import { LoadingState } from "@/components/loading-state/loading-state"
import { Button } from "@/components/ui/button"
import type { AnySchema } from "@orama/orama"
import {
  type RowSelectionState,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { PinoramaIntrospection } from "pinorama-types"
import { useIntl } from "react-intl"
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
  term: string
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
    props.term,
    props.filters,
    !props.liveMode
  )

  const liveLogsQuery = useLiveLogs(props.term, props.filters, props.liveMode)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const tableContainerRef = useRef(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
    props.term.length > 0 && Object.keys(props.filters).length > 0

  // biome-ignore lint: I need to update the selected row on row selection change
  useEffect(() => {
    const rowModel = table.getSelectedRowModel()
    const original = rowModel.rows[0]?.original
    props.onSelectedRowChange(original)
  }, [table.getSelectedRowModel()])

  // biome-ignore lint: I need to reset row selection on filters change
  useEffect(() => {
    clearSelection()
  }, [props.filters, props.term])

  const clearSelection = useCallback(() => {
    table.setRowSelection({})
  }, [table])

  useImperativeHandle(
    ref,
    () => ({
      refresh: () => logsQuery.refetch(),
      focusSearch: () => searchInputRef.current?.focus(),
      selectNextRow: () => {
        const currentIndex = utils.getCurrentRowIndex(table)
        utils.selectRowByIndex(currentIndex + 1, table)
      },
      selectPreviousRow: () => {
        const currentIndex = utils.getCurrentRowIndex(table)
        utils.selectRowByIndex(currentIndex - 1, table)
      },
      clearSelection,
      canSelectNextRow: () => utils.canSelectNextRow(table),
      canSelectPreviousRow: () => utils.canSelectPreviousRow(table)
    }),
    [logsQuery.refetch, clearSelection, table]
  )

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 24
  })

  const isLoading = logsQuery.status === "pending"
  const hasError = logsQuery.status === "error"
  const hasNoData = logsQuery.data?.length === 0 || false

  const showLoadMore =
    !props.liveMode && logsQuery.hasNextPage && !logsQuery.isFetchingNextPage

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <LogViewerHeader
        searchInputRef={searchInputRef}
        introspection={props.introspection}
        table={table}
        searchText={props.term}
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
      >
        <table className="text-sm w-full">
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
        {showLoadMore && (
          <div className="bottom-0 right-0 p-2 text-muted-foreground/60">
            <Button onClick={() => logsQuery.fetchNextPage()}>Load more</Button>
          </div>
        )}
      </div>
    </div>
  )
})
