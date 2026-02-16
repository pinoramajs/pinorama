import type { AnySchema } from "@orama/orama"
import { flexRender, type Table } from "@tanstack/react-table"
import type { PinoramaIntrospection } from "pinorama-types"
import { FormattedMessage } from "react-intl"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu"
import { createField } from "@/lib/introspection"

type TableHeadProps = {
  table: Table<unknown>
  introspection: PinoramaIntrospection<AnySchema>
}

export function TableHead({ table, introspection }: TableHeadProps) {
  "use no memo"
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <thead className="group sticky top-0 z-10 bg-background select-none flex font-mono" />
        }
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                colSpan={header.colSpan}
                className="relative px-2 mb-1 text-left font-normal text-muted-foreground align-middle h-8"
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
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => (
            <ContextMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              disabled={
                column.getIsVisible() &&
                table.getVisibleFlatColumns().length === 1
              }
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              onSelect={(e) => e.preventDefault()}
            >
              {createField(column.id, introspection).getDisplayLabel()}
            </ContextMenuCheckboxItem>
          ))}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => table.resetColumnVisibility()}>
          <FormattedMessage id="logExplorer.resetColumns" />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
