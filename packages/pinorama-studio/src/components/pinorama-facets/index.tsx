import { usePinoramaIntrospection } from "@/hooks"
import { Facet } from "./components/facet"

import type { SearchFilters } from "./types"

const ALLOWED_TYPES = ["string", "enum", "boolean"]

type PinoramaFacetsProps = {
  searchText: string
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function PinoramaFacets(props: PinoramaFacetsProps) {
  const { data: introspection, status, error } = usePinoramaIntrospection()

  if (status === "pending") {
    return null
  }

  if (status === "error") {
    return <div>Error: {error.message}</div>
  }

  return Object.keys(introspection.dbSchema)
    .filter((name) => {
      const type = introspection.dbSchema[name]
      return ALLOWED_TYPES.includes(type)
    })
    .map((name) => {
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
    })
}
