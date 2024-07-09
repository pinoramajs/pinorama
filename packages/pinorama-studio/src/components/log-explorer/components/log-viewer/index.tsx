import { useEffect, useMemo, useRef, useState } from "react"

import { EmptyState } from "@/components/empty-state/empty-state"
import { ErrorState } from "@/components/error-state/error-state"
import { LoadingState } from "@/components/loading-state/loading-state"
import { Input } from "@/components/ui/input"
import { usePinoramaIntrospection } from "@/hooks"
import {
  type ColumnDef,
  type RowSelectionState,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { EllipsisVertical, Search, SlidersVertical } from "lucide-react"
import { TableBody } from "./components/tbody"
import { TableHead } from "./components/thead"
import { useLogs } from "./hooks/use-logs"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { SearchFilters } from "../log-filters/types"

type LogViewerProps = {
  filters: SearchFilters
  searchText: string
  onSearchTextChange: (searchText: string) => void
  onRowSelectionChange: (row: any) => void
  onFiltersPanelToggle: () => void
}

export function LogViewer(props: LogViewerProps) {
  const {
    data: introspection,
    status: introspectionStatus,
    error: introspectionError
  }: any = usePinoramaIntrospection()

  const { data, status, error } = useLogs(props.searchText, props.filters)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = useMemo<ColumnDef<unknown>[]>(() => {
    if (!introspection?.dbSchema) return []

    return Object.keys(introspection.dbSchema).map((columnName) => {
      return {
        accessorKey: columnName,
        header: columnName,
        cell: (info) => {
          return (
            <div className={"overflow-ellipsis overflow-hidden"}>
              {info.getValue() as string}
            </div>
          )
        }
      }
    })
  }, [introspection?.dbSchema])

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

  if (introspectionStatus === "pending") {
    return <LoadingState />
  }

  if (introspectionStatus === "error") {
    return <ErrorState error={introspectionError} />
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="flex items-center p-3 pb-1 bg-background space-x-1.5">
        <Button
          variant="outline2"
          className="px-2.5"
          onClick={props.onFiltersPanelToggle}
        >
          <SlidersVertical className="h-[18px] w-[18px]" />
        </Button>
        <div className="relative flex items-center w-full">
          <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search logs..."
            className="pl-9"
            value={props.searchText}
            onChange={(e) => props.onSearchTextChange(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline2" className="px-2.5">
              <EllipsisVertical className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    disabled={
                      column.getIsVisible() &&
                      table.getVisibleFlatColumns().length === 1
                    }
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              onClick={() => table.resetColumnVisibility()}
            >
              Reset Columns
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        ref={tableContainerRef}
        className="h-full overflow-auto relative w-full"
      >
        <table className="text-sm w-full">
          <TableHead table={table} />
          {isLoading || hasNoData || hasError ? (
            <tbody>
              <tr>
                <td className="h-10 text-muted-foreground">
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
    </div>
  )
}
