import type { AnySchema } from "@orama/orama"
import type { PinoramaIntrospection } from "pinorama-types"
import { useMemo } from "react"
import { Facet } from "./components/facet"
import { useFacets } from "./hooks/use-facets"
import { getFacetsConfig } from "./lib/utils"
import type { SearchFilters } from "./types"

type PinoramaFacetsProps = {
  introspection: PinoramaIntrospection<AnySchema>
  searchText: string
  filters: SearchFilters
  liveMode: boolean
  liveSessionStart: number
  isDbEmpty: boolean
  onFiltersChange: (filters: SearchFilters) => void
}

export function LogFilters(props: PinoramaFacetsProps) {
  const facetsConfig = getFacetsConfig(props.introspection)

  const nonDateFacetNames = useMemo(
    () =>
      facetsConfig.definition
        .filter((f) => f.type !== "date")
        .map((f) => f.name),
    [facetsConfig.definition]
  )

  const {
    data: facetsData,
    fetchStatus,
    status,
    error
  } = useFacets(
    nonDateFacetNames,
    props.searchText,
    props.filters,
    props.liveMode,
    props.liveSessionStart,
    !props.isDbEmpty
  )

  return (
    <div className="flex flex-col h-full p-2 overflow-auto">
      {facetsConfig.definition.map((facet, index) => {
        const isDateFacet = facet.type === "date"

        return (
          <Facet
            key={facet.name}
            introspection={props.introspection}
            name={facet.name}
            type={facet.type}
            defaultOpen={index === 0}
            filters={props.filters}
            isDbEmpty={props.isDbEmpty}
            onFiltersChange={props.onFiltersChange}
            facetData={isDateFacet ? undefined : facetsData?.[facet.name]}
            facetFetchStatus={isDateFacet ? "idle" : fetchStatus}
            facetStatus={isDateFacet ? "success" : status}
            facetError={isDateFacet ? null : error}
          />
        )
      })}
    </div>
  )
}
