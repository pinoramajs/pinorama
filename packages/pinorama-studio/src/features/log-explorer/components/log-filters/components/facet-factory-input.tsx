import { Checkbox } from "@/components/ui/checkbox"
import { facetFilterOperationsFactory } from "../lib/operations"

import type { IntrospectionFacet } from "pinorama-types"
import type { SearchFilters } from "../types"

export function FacetFactoryInput(props: {
  id: string
  type: IntrospectionFacet
  name: string
  value: string | number
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}) {
  const operations: any = facetFilterOperationsFactory(props.type)

  const criteria = props.filters[props.name] || operations.create()
  const checked = operations.exists(props.value, criteria)

  const handleCheckedChange = (checked: boolean) => {
    const newCriteria = checked
      ? operations.add(criteria, props.value)
      : operations.remove(criteria, props.value)

    const filters = { ...props.filters, [props.name]: newCriteria }

    if (operations.length(newCriteria) === 0) {
      delete filters[props.name]
    }

    props.onFiltersChange(filters)
  }

  return (
    <Checkbox
      aria-label={props.value as string}
      id={props.id}
      className="hover:bg-muted border-muted-foreground"
      checked={checked}
      onCheckedChange={handleCheckedChange}
    />
  )
}
