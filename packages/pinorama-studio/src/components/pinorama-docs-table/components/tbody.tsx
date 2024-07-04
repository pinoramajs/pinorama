import { type Row, flexRender } from "@tanstack/react-table"
import type { Virtualizer } from "@tanstack/react-virtual"

type TableBodyProps = {
  virtualizer: Virtualizer<Element, Element>
  rows: any
}

export function TableBody({ virtualizer, rows }: TableBodyProps) {
  return (
    <tbody
      className="relative font-mono"
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const doc = rows[virtualItem.index] as Row<unknown>
        return (
          <tr
            data-index={virtualItem.index}
            key={doc.id}
            className="select-none flex absolute hover:bg-muted/50 odd:bg-muted/20"
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
                    "overflow-hidden overflow-ellipsis whitespace-nowrap h-[24px] px-3"
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
