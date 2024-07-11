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

  const selectedValuesNotInDataSource = useMemo(() => {
    const selectedItems: FacetValue[] = operations
      .values(props.filters[props.name] as FacetFilter)
      .map((value: string | number) => {
        return {
          value,
          count: facet?.values[value] || 0
        }
      })

    return selectedItems.filter(
      (item) => !(item.value in (facet?.values || {}))
    )
  }, [props.filters, props.name, facet?.values, operations])

  const allValues = useMemo(() => {
    const currentValues = Object.entries(facet?.values || {}).map(
      ([value, count]) => {
        // If the value is a number of type string,
        // we need to parse it to a number.
        let parsedValue: string | number = value
        if (props.type === "enum" && Number.isFinite(+value)) {
          parsedValue = Number(value)
        }
        return { value: parsedValue, count }
      }
    )

    return [...selectedValuesNotInDataSource, ...currentValues]
  }, [selectedValuesNotInDataSource, facet?.values, props.type])

  const hasError = status === "error"
  const hasNoData = allValues.length === 0

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
            values={allValues}
            filters={props.filters}
            onFiltersChange={props.onFiltersChange}
          />
        )
      ) : null}
    </div>
  )
}
