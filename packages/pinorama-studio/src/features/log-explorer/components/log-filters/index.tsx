import { useMemo } from "react"

import { Facet } from "./components/facet"

import type { AnySchema } from "@orama/orama"
import type { PinoramaIntrospection } from "pinorama-types"
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

  return (
    <div className="flex flex-col h-full p-3 overflow-auto">
      {facetsConfig.definition.map((facet) => {
        return (
          <Facet
            key={facet.name}
            introspection={props.introspection}
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
