import { type Row, flexRender } from "@tanstack/react-table"
import type { Virtualizer } from "@tanstack/react-virtual"

import clsx from "clsx"
import style from "./tbody.module.css"

type TableBodyProps = {
  virtualizer: Virtualizer<Element, Element>
  rows: Row<unknown>[]
}

export function TableBody({ virtualizer, rows }: TableBodyProps) {
  return (
    <tbody
      className={style.body}
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
            className={clsx(style.row, row.getIsSelected() && style.rowMuted)}
            style={{ transform: `translateY(${virtualItem.start}px)` }}
          >
            {cells.map((cell) => {
              return (
                <td
                  key={cell.id}
                  className={style.data}
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
