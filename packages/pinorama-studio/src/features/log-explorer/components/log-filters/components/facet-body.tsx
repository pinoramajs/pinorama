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
    <div className="border box-border rounded-md overflow-auto max-h-[241px] my-2">
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
    </div>
  )
}
