import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import type { OramaPropType, SearchFilters } from "../types"
import { FacetFactoryInput } from "./facet-factory-input"

import style from "./facet-item.module.css"

type FacetItemProps = {
  name: string
  type: OramaPropType
  value: string | number
  count: number
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function FacetItem(props: FacetItemProps) {
  return (
    <div className={style.container}>
      <FacetFactoryInput
        id={props.value as string}
        type={props.type}
        name={props.name}
        value={props.value}
        filters={props.filters}
        onFiltersChange={props.onFiltersChange}
      />
      <Label htmlFor={props.value as string} className={style.label}>
        {props.value}
      </Label>
      <Badge variant="secondary" className={style.badge}>
        {props.count}
      </Badge>
    </div>
  )
}
