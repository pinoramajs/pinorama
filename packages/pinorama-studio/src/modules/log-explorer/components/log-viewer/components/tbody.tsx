import { flexRender, type Row } from "@tanstack/react-table"
import type { Virtualizer } from "@tanstack/react-virtual"

type TableBodyProps = {
  virtualizer: Virtualizer<any, Element>
  rows: Row<unknown>[]
}

export function TableBody({ virtualizer, rows }: TableBodyProps) {
  return (
    <tbody
      className="relative font-mono"
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const row = rows[virtualItem.index] as Row<unknown>
        const cells = row.getVisibleCells()

        return (
          <tr
            key={row.id}
            data-index={virtualItem.index}
            onClick={row.getToggleSelectedHandler()}
            onKeyDown={() => {}}
            className={`select-none cursor-pointer flex absolute hover:bg-muted/50 odd:bg-muted/20 w-full ${row.getIsSelected() ? "bg-muted/75 hover:bg-muted/75 odd:bg-muted/75" : ""}`}
            style={{ transform: `translateY(${virtualItem.start}px)` }}
          >
            {cells.map((cell) => {
              return (
                <td
                  key={cell.id}
                  className={
                    "overflow-hidden overflow-ellipsis whitespace-nowrap h-[20px] px-3 leading-[20px]"
                  }
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}
