import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { type Table, flexRender } from "@tanstack/react-table"

export function TableHead({ table }: { table: Table<unknown> }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <thead className="group sticky top-0 z-10 bg-background select-none flex">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="relative px-3 mb-1 text-left font-normal text-muted-foreground align-middle h-9"
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
                      className={`absolute right-0 top-0 h-[32px] w-[3px] bg-muted opacity-0 group-hover:opacity-100 cursor-col-resize select-none touch-none ${
                        header.column.getIsResizing()
                          ? "group-hover:bg-accent-foreground bg-accent-foreground"
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
              typeof column.accessorFn !== "undefined" && column.getCanHide()
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
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
  )
}
