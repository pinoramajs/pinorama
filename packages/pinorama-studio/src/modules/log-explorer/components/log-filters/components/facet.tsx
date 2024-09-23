import { EmptyStateInline } from "@/components/empty-state/empty-state"
import { useCallback, useMemo, useState } from "react"
import { useIntl } from "react-intl"
import { facetFilterOperationsFactory } from "../lib/operations"
import { FacetBody } from "./facet-body"
import { FacetHeader } from "./facet-header"

import type { AnySchema } from "@orama/orama"
import type { IntrospectionFacet, PinoramaIntrospection } from "pinorama-types"
import type { FacetFilter, FacetValue, SearchFilters } from "../types"

type FacetProps = {
  introspection: PinoramaIntrospection<AnySchema>
  name: string
  count: number
  loading?: boolean
  values: Record<string, number>
  type: IntrospectionFacet
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function Facet(props: FacetProps) {
  const intl = useIntl()

  const [open, setOpen] = useState(true)

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
          count: props.values[value as number] || 0
        }
      })

    return selectedItems.filter((item) => !(item.value in (props.values || {})))
  }, [props.filters, props.name, props.values, operations])

  const allValues = useMemo(() => {
    const currentValues = Object.entries(props.values || {})
      .filter(([value]) => value !== "") // NOTE: Don't show empty values
      .map(([value, count]) => {
        // NOTE: If the value is a number of type string,
        // we need to parse it to a number.
        let parsedValue: string | number = value
        if (props.type === "enum" && Number.isFinite(+value)) {
          parsedValue = Number(value)
        }
        return { value: parsedValue, count }
      })

    return [...selectedValuesNotInDataSource, ...currentValues]
  }, [selectedValuesNotInDataSource, props.values, props.type])

  const hasNoData = allValues.length === 0

  return (
    <div>
      <FacetHeader
        introspection={props.introspection}
        name={props.name}
        loading={props.loading}
        count={selelectedOptionCount}
        open={open}
        onClick={() => setOpen((value) => !value)}
        onCountClick={handleReset}
      />
      {open ? (
        hasNoData ? (
          <EmptyStateInline
            message={intl.formatMessage({ id: "labels.noResultFound" })}
            className="my-2 mx-0"
          />
        ) : (
          <FacetBody
            introspection={props.introspection}
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
