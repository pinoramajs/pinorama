import type { AnySchema } from "@orama/orama"
import type { IntrospectionFacet, PinoramaIntrospection } from "pinorama-types"
import { useCallback, useMemo, useState } from "react"
import { useIntl } from "react-intl"
import { EmptyStateInline } from "@/components/empty-state/empty-state"
import { ErrorState } from "@/components/error-state/error-state"
import { useFacet } from "../hooks/use-facet"
import { facetFilterOperationsFactory } from "../lib/operations"
import type { FacetFilter, FacetValue, SearchFilters } from "../types"
import { DateFacetBody } from "./date-facet-body"
import { FacetBody } from "./facet-body"
import { FacetHeader } from "./facet-header"

type FacetProps = {
  introspection: PinoramaIntrospection<AnySchema>
  name: string
  type: IntrospectionFacet
  searchText: string
  filters: SearchFilters
  liveMode: boolean
  liveSessionStart: number
  onFiltersChange: (filters: SearchFilters) => void
}

export function Facet(props: FacetProps) {
  const intl = useIntl()

  const isDateFacet = props.type === "date"
  const [open, setOpen] = useState(true)

  const {
    data: facet,
    fetchStatus,
    status,
    error
  } = useFacet(
    props.name,
    props.searchText,
    props.filters,
    props.liveMode,
    props.liveSessionStart,
    !isDateFacet
  )

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
    [props.onFiltersChange, props.name, props.filters, props]
  )

  const selectedValuesNotInDataSource = useMemo(() => {
    if (isDateFacet) return []

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
  }, [isDateFacet, props.filters, props.name, facet?.values, operations])

  const allValues = useMemo(() => {
    if (isDateFacet) return []

    const currentValues = Object.entries(facet?.values || {})
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
  }, [isDateFacet, selectedValuesNotInDataSource, facet?.values, props.type])

  const hasError = status === "error"
  const hasNoData = allValues.length === 0

  const renderBody = () => {
    if (isDateFacet) {
      return (
        <DateFacetBody
          name={props.name}
          filters={props.filters}
          onFiltersChange={props.onFiltersChange}
        />
      )
    }

    if (hasError) {
      return <ErrorState error={error} className="my-2 mx-0" />
    }

    if (hasNoData) {
      return (
        <EmptyStateInline
          message={intl.formatMessage({ id: "labels.noResultFound" })}
          className="my-2 mx-0"
        />
      )
    }

    return (
      <FacetBody
        introspection={props.introspection}
        name={props.name}
        type={props.type}
        values={allValues}
        filters={props.filters}
        onFiltersChange={props.onFiltersChange}
      />
    )
  }

  return (
    <div>
      <FacetHeader
        introspection={props.introspection}
        name={props.name}
        loading={!isDateFacet && fetchStatus === "fetching"}
        count={selelectedOptionCount}
        open={open}
        onClick={() => setOpen((value) => !value)}
        onCountClick={handleReset}
      />
      {open ? renderBody() : null}
    </div>
  )
}
