import type { AnySchema } from "@orama/orama"
import type { ColumnDef, Table } from "@tanstack/react-table"
import type { Virtualizer } from "@tanstack/react-virtual"
import type { PinoramaIntrospection } from "pinorama-types"
import { createField } from "@/lib/introspection"
import { cn } from "@/lib/utils"

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

export const selectRowByIndex = (index: number, table: Table<unknown>) => {
  const totalRows = table.getRowModel().rows.length
  if (index < 0 || index >= totalRows) return false

  table.setRowSelection({ [index]: true })
  return true
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

export const scrollRowIntoView = (
  virtualizer: Virtualizer<Element, Element>,
  index: number
) => {
  virtualizer.scrollToIndex(index, { align: "auto" })
  requestAnimationFrame(() => {
    const row = document.querySelector(`[data-index="${index}"]`)
    row?.scrollIntoView({ block: "nearest" })
  })
}
