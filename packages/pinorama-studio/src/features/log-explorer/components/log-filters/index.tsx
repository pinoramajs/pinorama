import { useMemo } from "react"

import { usePinoramaConnection } from "@/hooks"
import { Facet } from "./components/facet"

import type { IntrospectionFacet } from "pinorama-types"
import type { SearchFilters } from "./types"

type PinoramaFacetsProps = {
  searchText: string
  filters: SearchFilters
  liveMode: boolean
  onFiltersChange: (filters: SearchFilters) => void
}

export function LogFilters(props: PinoramaFacetsProps) {
  const { introspection } = usePinoramaConnection()

  const facets = useMemo(() => {
    const facets = introspection?.facets
    if (!facets) return []

    return Object.keys(facets).map((fieldName) => {
      return {
        name: fieldName,
        type: facets[fieldName] as IntrospectionFacet
      }
    })
  }, [introspection])

  if (!introspection) {
    return null
  }

  return (
    <div className="flex flex-col h-full p-3 overflow-auto">
      {facets.map((facet) => {
        return (
          <Facet
            key={facet.name}
            name={facet.name}
            type={facet.type}
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
