import { flexRender, type Table } from "@tanstack/react-table"

export function TableHead({ table }: { table: Table<unknown> }) {
  return (
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
                // biome-ignore lint/a11y/noStaticElementInteractions: resize handle requires mouse/touch events
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
  )
}
