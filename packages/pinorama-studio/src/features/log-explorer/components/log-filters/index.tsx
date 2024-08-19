import { usePinoramaConnection } from "@/hooks"
import { Facet } from "./components/facet"

import { useMemo } from "react"
import type { SearchFilters } from "./types"

const ALLOWED_TYPES = ["string", "enum", "boolean"]

type PinoramaFacetsProps = {
  searchText: string
  filters: SearchFilters
  liveMode: boolean
  onFiltersChange: (filters: SearchFilters) => void
}

export function LogFilters(props: PinoramaFacetsProps) {
  const { introspection } = usePinoramaConnection()

  const facets = useMemo(() => {
    if (!introspection) return []
    return Object.keys(introspection?.dbSchema).filter((name) => {
      const type = introspection.dbSchema[name]
      return ALLOWED_TYPES.includes(type)
    })
  }, [introspection])

  return (
    <div className="flex flex-col h-full p-3 overflow-auto">
      {facets.map((name) => {
        return (
          <Facet
            key={name}
            name={name}
            type={introspection.dbSchema[name]}
            searchText={props.searchText}
            filters={props.filters}
            liveMode={props.liveMode}
            onFiltersChange={props.onFiltersChange}
          />
        )
      })}
    </div>
  )
}
