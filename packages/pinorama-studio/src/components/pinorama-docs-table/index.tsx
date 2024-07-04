import { useRef } from "react"

import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { TableBody } from "./components/tbody"
import { TableHead } from "./components/thead"
import { useColumns } from "./hooks/use-columns"
import { useDocs } from "./hooks/use-docs"

export function PinoramaDocsTable() {
  const columns = useColumns()
  const { data } = useDocs()

  const table = useReactTable({
    data: data || [],
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
        <TableBody virtualizer={virtualizer} rows={rows} />
      </table>
    </div>
  )
}
