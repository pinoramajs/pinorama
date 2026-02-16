import type { AnySchema } from "@orama/orama"
import { flexRender, type Row } from "@tanstack/react-table"
import type { Virtualizer } from "@tanstack/react-virtual"
import type { PinoramaIntrospection } from "pinorama-types"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { createField } from "@/lib/introspection"

type TableBodyProps = {
  virtualizer: Virtualizer<any, Element>
  rows: Row<unknown>[]
  introspection: PinoramaIntrospection<AnySchema>
}

export function TableBody({
  virtualizer,
  rows,
  introspection
}: TableBodyProps) {
  "use no memo"
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
            data-selected={row.getIsSelected() || undefined}
            className={`select-none cursor-pointer flex absolute w-full ${row.getIsSelected() ? "bg-foreground/10" : "hover:bg-muted/50 odd:bg-muted/20"}`}
            style={{ transform: `translateY(${virtualItem.start}px)` }}
          >
            {cells.map((cell) => {
              const field = createField(cell.column.id, introspection)
              const value = cell.getValue() as string | number

              return (
                <td
                  key={cell.id}
                  className="h-[20px] px-2 leading-[20px]"
                  style={{ width: cell.column.getSize() }}
                >
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap" />
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center" sideOffset={8}>
                      {value ? String(field.format(value)) : "—"}
                    </TooltipContent>
                  </Tooltip>
                </td>
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}
