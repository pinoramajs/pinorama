import { EmptyState } from "@/components/empty-state/empty-state"
import { ErrorState } from "@/components/error-state/error-state"
import { useCallback, useMemo, useState } from "react"
import { useFacet } from "../hooks/use-facet"
import { facetFilterOperationsFactory } from "../lib/operations"
import type {
  FacetFilter,
  FacetValue,
  OramaPropType,
  SearchFilters
} from "../types"
import { FacetBody } from "./facet-body"
import { FacetHeader } from "./facet-header"

type FacetProps = {
  name: string
  type: OramaPropType
  searchText: string
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function Facet(props: FacetProps) {
  const [open, setOpen] = useState(true)

  const {
    data: facet,
    fetchStatus,
    status,
    error
  } = useFacet(props.name, props.searchText, props.filters)

  const operations: any = facetFilterOperationsFactory(props.type)
  const criteria = props.filters[props.name] || operations.create()
  const selelectedOptionCount = operations.length(criteria)

  const handleReset = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      const filters = { ...props.filters }
      delete filters[props.name]
      props.onFiltersChange(filters)
    },
    [props.onFiltersChange, props.name, props.filters]
  )

  const selected: FacetValue[] = useMemo(() => {
    return operations
      .values(props.filters[props.name] as FacetFilter)
      .map((value: string | number) => {
        return {
          value,
          count: facet?.values[value] || 0
        }
      })
  }, [facet?.values, props.filters, props.name, operations.values])

  const unselected: FacetValue[] = useMemo(() => {
    return Object.entries(facet?.values || {})
      .map(([value, count]) => {
        // If the value is a number of type string,
        // convert it to a number.
        let parsedValue: string | number = value
        if (props.type === "enum" && Number.isFinite(+value)) {
          parsedValue = Number(value)
        }
        return { value: parsedValue, count }
      })
      .filter(
        ({ value }) => !selected.some((selected) => selected.value === value)
      )
  }, [facet?.values, props.type, selected])

  const values = useMemo(
    () => selected.concat(unselected),
    [selected, unselected]
  )

  const hasError = status === "error"
  const hasNoData = values.length === 0

  return (
    <div>
      <FacetHeader
        name={props.name}
        loading={fetchStatus === "fetching"}
        count={selelectedOptionCount}
        open={open}
        onClick={() => setOpen((value) => !value)}
        onCountClick={handleReset}
      />
      {open ? (
        hasError ? (
          <ErrorState error={error} className="my-2 mx-0" />
        ) : hasNoData ? (
          <EmptyState message={"No results found"} className="my-2 mx-0" />
        ) : (
          <FacetBody
            name={props.name}
            type={props.type}
            values={values}
            filters={props.filters}
            onFiltersChange={props.onFiltersChange}
          />
        )
      ) : null}
    </div>
  )
}
