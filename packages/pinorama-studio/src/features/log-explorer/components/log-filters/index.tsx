import { ErrorState } from "@/components/error-state/error-state"
import { usePinoramaIntrospection } from "@/hooks"
import { Facet } from "./components/facet"

import { LoadingState } from "@/components/loading-state/loading-state"
import { useMemo } from "react"
import type { SearchFilters } from "./types"

const ALLOWED_TYPES = ["string", "enum", "boolean"]

type PinoramaFacetsProps = {
  searchText: string
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function LogFilters(props: PinoramaFacetsProps) {
  const { data: introspection, status, error } = usePinoramaIntrospection()

  const facets = useMemo(() => {
    if (!introspection) return []
    return Object.keys(introspection?.dbSchema).filter((name) => {
      const type = introspection.dbSchema[name]
      return ALLOWED_TYPES.includes(type)
    })
  }, [introspection])

  if (status === "pending") {
    return <LoadingState />
  }

  if (status === "error") {
    return <ErrorState error={error} />
  }

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
            onFiltersChange={props.onFiltersChange}
          />
        )
      })}
    </div>
  )
}
