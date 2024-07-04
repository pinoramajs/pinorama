import { usePinoramaIntrospection } from "@/hooks"
import type { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

export const useColumns = () => {
  const { data: introspection }: any = usePinoramaIntrospection()

  const columns = useMemo<ColumnDef<unknown>[]>(() => {
    if (!introspection?.dbSchema) return []

    return Object.keys(introspection.dbSchema).map((columnName) => {
      return {
        accessorKey: columnName,
        header: columnName,
        cell: (info) => {
          return (
            <div className={"overflow-ellipsis overflow-hidden"}>
              {info.getValue() as string}
            </div>
          )
        }
      }
    })
  }, [introspection?.dbSchema])

  return columns
}
