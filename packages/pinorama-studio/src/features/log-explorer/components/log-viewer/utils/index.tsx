import { createField } from "@/lib/introspection"
import { cn } from "@/lib/utils"
import type { AnySchema } from "@orama/orama"
import type { ColumnDef } from "@tanstack/react-table"
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
