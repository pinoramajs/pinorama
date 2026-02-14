import type { AnySchema } from "@orama/orama"
import type { FetchStatus } from "@tanstack/react-query"
import type { IntrospectionFacet, PinoramaIntrospection } from "pinorama-types"
import { useState } from "react"
import { useIntl } from "react-intl"
import { InlineStatus } from "@/components/inline-status"
import type { OramaFacetValue } from "../hooks/use-facets"
import { facetFilterOperationsFactory } from "../lib/operations"
import type { FacetFilter, FacetValue, SearchFilters } from "../types"
import { DateFacetBody } from "./date-facet-body"
import { FacetBody } from "./facet-body"
import { FacetHeader } from "./facet-header"

type FacetProps = {
  introspection: PinoramaIntrospection<AnySchema>
  name: string
  type: IntrospectionFacet
  filters: SearchFilters
  isDbEmpty: boolean
  defaultOpen?: boolean
  onFiltersChange: (filters: SearchFilters) => void
  facetData?: OramaFacetValue
  facetFetchStatus: FetchStatus
  facetStatus: "error" | "success" | "pending"
  facetError: Error | null
}

export function Facet(props: FacetProps) {
  const intl = useIntl()

  const isDateFacet = props.type === "date"
  const [open, setOpen] = useState(props.defaultOpen ?? false)

  const facet = props.facetData

  const operations: any = facetFilterOperationsFactory(props.type)
  const criteria = props.filters[props.name] || operations.create()
  const selelectedOptionCount = operations.length(criteria)

  const handleReset = (event: React.MouseEvent) => {
    event.stopPropagation()
    const filters = { ...props.filters }
    delete filters[props.name]
    props.onFiltersChange(filters)
  }

  const selectedValuesNotInDataSource = (() => {
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
  })()

  const allValues = (() => {
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
  })()

  const hasError = props.facetStatus === "error"
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

    if (props.isDbEmpty) {
      return null
    }

    if (hasError) {
      return (
        <InlineStatus
          variant="error"
          error={props.facetError as Error}
          className="my-2"
        />
      )
    }

    if (hasNoData) {
      return (
        <InlineStatus
          variant="empty"
          message={intl.formatMessage({ id: "labels.noResultFound" })}
          className="my-2"
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
        loading={!isDateFacet && props.facetFetchStatus === "fetching"}
        count={selelectedOptionCount}
        open={open}
        onClick={() => setOpen((value) => !value)}
        onCountClick={handleReset}
      />
      {open ? renderBody() : null}
    </div>
  )
}
