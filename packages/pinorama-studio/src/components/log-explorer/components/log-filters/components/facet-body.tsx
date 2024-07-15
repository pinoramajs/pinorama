import type { FacetValue, OramaPropType, SearchFilters } from "../types"
import { FacetItem } from "./facet-item"

import style from './facet-body.module.css'

type FacetBodyProps = {
  name: string
  type: OramaPropType
  values: FacetValue[]
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function FacetBody(props: FacetBodyProps) {
  return (
    <div className={style.container}>
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
