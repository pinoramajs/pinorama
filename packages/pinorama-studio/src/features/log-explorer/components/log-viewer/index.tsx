import { useEffect, useMemo, useRef, useState } from "react"

import { EmptyStateInline } from "@/components/empty-state/empty-state"
import { ErrorState } from "@/components/error-state/error-state"
import { LoadingState } from "@/components/loading-state/loading-state"
import { usePinoramaConnection } from "@/hooks"
import { createField } from "@/lib/introspection"
import { cn } from "@/lib/utils"
import {
  type ColumnDef,
  type RowSelectionState,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useIntl } from "react-intl"
import type { SearchFilters } from "../log-filters/types"
import { LogViewerHeader } from "./components/header/header"
import { TableBody } from "./components/tbody"
import { TableHead } from "./components/thead"
import { useLogs } from "./hooks/use-logs"

type LogViewerProps = {
  filters: SearchFilters
  searchText: string
  onSearchTextChange: (searchText: string) => void
  onRowSelectionChange: (row: any) => void
  onToggleFiltersButtonClick: () => void
  onClearFiltersButtonClick: () => void
}

export function LogViewer(props: LogViewerProps) {
  const intl = useIntl()

  const { introspection } = usePinoramaConnection()

  const { data, status, error } = useLogs(props.searchText, props.filters)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = useMemo<ColumnDef<unknown>[]>(() => {
    if (!introspection?.dbSchema) return []

    return Object.keys(introspection.dbSchema).map((columnName) => {
      const field = createField(columnName, introspection)
      return {
        accessorKey: columnName,
        header: () => field.getDisplayLabel(),
        cell: (info) => {
          const value = info.getValue() as string | number
          const formattedValue = field.format(value)
          const className = field.getClassName(value)
          return (
            <div className={cn("overflow-ellipsis overflow-hidden", className)}>
              {formattedValue}
            </div>
          )
        }
      }
    })
  }, [introspection])

  const logs = useMemo(() => data ?? [], [data])

  const table = useReactTable({
    data: logs,
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: false,
    state: { rowSelection },
    enableRowSelection: true
  })

  const hasFilters =
    props.searchText.length > 0 && Object.keys(props.filters).length > 0

  // biome-ignore lint: I need to pop up the selected row
  useEffect(() => {
    const rowModel = table.getSelectedRowModel()
    const original = rowModel.rows[0]?.original
    props.onRowSelectionChange(original)
  }, [table.getSelectedRowModel()])

  // biome-ignore lint: I need to reset row selection on filters change
  useEffect(() => {
    table.setRowSelection({})
  }, [props.filters, props.searchText])

  const { rows } = table.getRowModel()

  const tableContainerRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 24,
    overscan: 100
  })

  const isLoading = status === "pending"
  const hasError = status === "error"
  const hasNoData = data?.length === 0 || false

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <LogViewerHeader
        table={table}
        searchText={props.searchText}
        showClearFiltersButton={hasFilters}
        onSearchTextChange={props.onSearchTextChange}
        onToggleFiltersButtonClick={props.onToggleFiltersButtonClick}
        onClearFiltersButtonClick={props.onClearFiltersButtonClick}
      />

      <div
        className="h-full overflow-auto relative w-full"
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
                    <ErrorState error={error} />
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
}
