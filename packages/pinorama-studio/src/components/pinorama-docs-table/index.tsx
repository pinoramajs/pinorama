import { useEffect, useMemo, useRef, useState } from "react"

import {
  type RowSelectionState,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { EmptyState } from "../empty-state/empty-state"
import { ErrorState } from "../error-state/error-state"
import { LoadingState } from "../loading-state/loading-state"
import type { SearchFilters } from "../pinorama-facets/types"
import { TableBody } from "./components/tbody"
import { TableHead } from "./components/thead"
import { useColumns } from "./hooks/use-columns"
import { useDocs } from "./hooks/use-docs"

type PinoramaDocsTableProps = {
  searchText: string
  filters: SearchFilters
  onRowSelectionChange: (row: any) => void
}

export function PinoramaDocsTable(props: PinoramaDocsTableProps) {
  const columns = useColumns()
  const { data, status, error } = useDocs(props.searchText, props.filters)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const docs = useMemo(() => data ?? [], [data])

  const table = useReactTable({
    data: docs,
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection: false,
    state: { rowSelection },
    enableRowSelection: true
  })

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
    <div
      ref={tableContainerRef}
      className="h-full overflow-auto relative w-full"
    >
      <table className="text-sm w-full">
        <TableHead table={table} />
        {isLoading || hasNoData || hasError ? (
          <tbody>
            <tr>
              <td className="h-10 px-3 text-muted-foreground">
                {isLoading ? (
                  <LoadingState />
                ) : hasError ? (
                  <ErrorState error={error} />
                ) : hasNoData ? (
                  <EmptyState message={"No logs found"} />
                ) : null}
              </td>
            </tr>
          </tbody>
        ) : (
          <TableBody virtualizer={virtualizer} rows={rows} />
        )}
      </table>
    </div>
  )
}
