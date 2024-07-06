import { useMemo, useRef } from "react"

import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { LoaderIcon } from "lucide-react"
import type { SearchFilters } from "../pinorama-facets/types"
import { TableBody } from "./components/tbody"
import { TableHead } from "./components/thead"
import { useColumns } from "./hooks/use-columns"
import { useDocs } from "./hooks/use-docs"

type PinoramaDocsTableProps = {
  searchText: string
  filters: SearchFilters
}

export function PinoramaDocsTable(props: PinoramaDocsTableProps) {
  const columns = useColumns()
  const { data, status } = useDocs(props.searchText, props.filters)

  const docs = useMemo(() => data ?? [], [data])

  const table = useReactTable({
    data: docs,
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel()
  })

  const { rows } = table.getRowModel()

  const tableContainerRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 24,
    overscan: 100
  })

  return (
    <div
      ref={tableContainerRef}
      className="h-full overflow-auto relative w-full"
    >
      <table className="text-sm w-full">
        <TableHead table={table} />
        {status === "pending" ? (
          <tbody>
            <tr>
              <td
                colSpan={columns.length}
                className="h-10 px-3 text-muted-foreground flex items-center"
              >
                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                Loading...
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
