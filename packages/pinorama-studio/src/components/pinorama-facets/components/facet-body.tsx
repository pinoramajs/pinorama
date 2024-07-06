import type { FacetValue, OramaPropType, SearchFilters } from "../types"
import { FacetItem } from "./facet-item"

type FacetBodyProps = {
  name: string
  type: OramaPropType
  values: FacetValue[]
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function FacetBody(props: FacetBodyProps) {
  return (
    <div className="my-2">
      <div className="border border-muted rounded-md overflow-auto max-h-[241px] my-2">
        {props.values.length === 0 ? (
          <div className="h-10 flex items-center justify-center text-sm text-muted-foreground">
            No results found
          </div>
        ) : (
          <>
            {props.values?.map(({ value, count }) => {
              return (
                <FacetItem
                  key={value as string}
                  name={props.name}
                  type={props.type}
                  value={value}
                  count={count}
                  filters={props.filters}
                  onFiltersChange={props.onFiltersChange}
                />
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
