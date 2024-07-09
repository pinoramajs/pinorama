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

  /*
  const handleResetFilters = useCallback(() => {
    setFilters({})
    setSearchText("")
  }, [])

  const hasFilters = Object.keys(filters).length > 0 || searchText.length > 0
  */

  return (
    <div className="flex flex-col h-full p-3 overflow-auto">
      {/* <div className="flex text-sm whitespace-nowrap justify-between items-center mb-0.5"> */}
      {/*   <div className="flex font-medium px-2 h-10 items-center"> */}
      {/*     Filters */}
      {/*   </div> */}
      {/*   {hasFilters ? ( */}
      {/*     <Button */}
      {/*       variant="outline" */}
      {/*       className="text-muted-foreground" */}
      {/*       onClick={handleResetFilters} */}
      {/*     > */}
      {/*       Reset */}
      {/*     </Button> */}
      {/*   ) : null} */}
      {/* </div> */}
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
