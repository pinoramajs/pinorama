import { createField } from "@/lib/introspection"
import { cn } from "@/lib/utils"
import type { AnySchema } from "@orama/orama"
import type { ColumnDef, Table } from "@tanstack/react-table"
import debounce from "debounce"
import type { PinoramaIntrospection } from "pinorama-types"

const DEFAULT_COLUMN_SIZE = 150

export const getColumnsConfig = (
  introspection: PinoramaIntrospection<AnySchema>
) => {
  const visibility: Record<string, boolean> = {}
  const sizing: Record<string, number> = {}
  const definition: ColumnDef<unknown>[] = []

  const columns = introspection?.columns
  if (!columns)
    return {
      visibility,
      sizing,
      definition
    }

  for (const [name, config] of Object.entries(columns)) {
    // Visibility
    visibility[name] = config?.visible ?? false

    // Sizing
    sizing[name] = config?.size ?? DEFAULT_COLUMN_SIZE

    // Definition
    const field = createField(name, introspection)
    definition.push({
      id: name,
      // accessorKey: columnName.split(".")[0] || columnName,
      accessorKey: name,
      header: () => field.getDisplayLabel(),
      cell: (info) => {
        const value = info.getValue() as string | number
        if (!value) {
          return <div className="text-muted-foreground/60">—</div>
        }

        const formattedValue = field.format(value)
        const className = field.getClassName(value)
        return (
          <div className={cn("overflow-ellipsis overflow-hidden", className)}>
            {formattedValue}
          </div>
        )
      }
    })
  }

  return {
    visibility,
    sizing,
    definition
  }
}

const debouncedScrollIntoView = debounce((element: Element) => {
  element.scrollIntoView({
    block: "center",
    behavior: "smooth"
  })
}, 50)

export const selectRowByIndex = (index: number, table: Table<unknown>) => {
  const totalRows = table.getRowModel().rows.length
  const validIndex = Math.max(0, Math.min(index, totalRows - 1))

  table.setRowSelection({ [index]: true })

  const row = document.querySelector(`[data-index="${validIndex}"]`)
  if (row) {
    debouncedScrollIntoView(row)
  }
}

export const getCurrentRowIndex = (table: Table<unknown>) => {
  const selectedKeys = table.getSelectedRowModel()
  return selectedKeys.rows[0]?.index ?? -1
}

export const canSelectNextRow = (table: Table<unknown>) => {
  const currentRowIndex = getCurrentRowIndex(table)
  return currentRowIndex < table.getRowModel().rows.length - 1
}

export const canSelectPreviousRow = (table: Table<unknown>) => {
  const currentRowIndex = getCurrentRowIndex(table)
  return currentRowIndex > 0
}
