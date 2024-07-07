import { usePinoramaIntrospection } from "@/hooks"
import { Facet } from "./components/facet"

import { ErrorState } from "../error-state/error-state"
import type { SearchFilters } from "./types"

const ALLOWED_TYPES = ["string", "enum", "boolean"]

type PinoramaFacetsProps = {
  searchText: string
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function PinoramaFacets(props: PinoramaFacetsProps) {
  const { data: introspection, status, error } = usePinoramaIntrospection()

  // if (status === "pending") {
  //   return <LoadingState />
  // }

  if (status === "error") {
    return <ErrorState error={error} />
  }

  const hasNoData = typeof introspection?.dbSchema === "undefined"

  if (hasNoData) {
    return null
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
