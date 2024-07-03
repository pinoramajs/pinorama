import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import {
  type Row,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useMemo, useRef } from "react"

const columnHelper = createColumnHelper()

export function Docs({ docs, introspection }: any) {
  const columns = useMemo(() => {
    return Object.keys(introspection.dbSchema).map((columnName: any) => {
      return columnHelper.accessor(columnName, {
        header: columnName,
        cell: (info) => {
          return (
            <div className={"overflow-ellipsis overflow-hidden"}>
              {info.getValue() as string}
            </div>
          )
        }
      })
    })
  }, [introspection?.dbSchema])

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
      className="h-screen overflow-auto relative font-mono"
    >
      <table
        className="text-[14px]"
        style={{ fontFamily: "BlexMono Nerd Font" }}
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <thead className="group sticky top-0 z-10 bg-background select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="relative px-2 mb-1 text-left font-normal text-muted-foreground align-middle h-9"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-[3px] bg-muted opacity-0 group-hover:opacity-100 cursor-col-resize select-none touch-none ${
                            header.column.getIsResizing()
                              ? "group-hover:bg-lime-400 bg-lime-400"
                              : ""
                          }`}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-44">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <ContextMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
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
                  </ContextMenuCheckboxItem>
                )
              })}
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem
              onClick={() => {
                table.resetColumnVisibility()
              }}
            >
              Reset Columns
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
        <tbody
          className="relative"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const doc = rows[virtualItem.index] as Row<unknown>
            return (
              <tr
                data-index={virtualItem.index}
                key={doc.id}
                className="select-none flex absolute hover:bg-muted/50 odd:bg-muted/20 rounded"
                style={{
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`
                }}
              >
                {doc.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={
                        "overflow-hidden overflow-ellipsis whitespace-nowrap h-[24px] px-2"
                      }
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
