import { useMemo } from "react"

import { Facet } from "./components/facet"

import type { AnySchema } from "@orama/orama"
import type { PinoramaIntrospection } from "pinorama-types"
import { type OramaFacetValue, useFacets } from "./hooks/use-facets"
import { getFacetsConfig } from "./lib/utils"
import type { SearchFilters } from "./types"

type PinoramaFacetsProps = {
  introspection: PinoramaIntrospection<AnySchema>
  searchText: string
  filters: SearchFilters
  liveMode: boolean
  onFiltersChange: (filters: SearchFilters) => void
}

export function LogFilters(props: PinoramaFacetsProps) {
  const facetsConfig = useMemo(() => {
    return getFacetsConfig(props.introspection)
  }, [props.introspection])

  const names = useMemo(() => {
    return facetsConfig.definition.map((facet) => facet.name)
  }, [facetsConfig])

  const { data: facets, isFetching } = useFacets(
    names,
    props.searchText,
    props.filters,
    props.liveMode
  )

  return (
    <div className="flex flex-col h-full p-3 overflow-auto">
      {facetsConfig.definition.map((facetDef) => {
        const facet: OramaFacetValue | undefined = facets?.[facetDef.name]
        return (
          <Facet
            key={facetDef.name}
            introspection={props.introspection}
            loading={isFetching}
            name={facetDef.name}
            count={facet?.count ?? 0}
            values={facet?.values ?? {}}
            type={facetDef.type}
            filters={props.filters}
            onFiltersChange={props.onFiltersChange}
          />
        )
      })}
    </div>
  )
}
