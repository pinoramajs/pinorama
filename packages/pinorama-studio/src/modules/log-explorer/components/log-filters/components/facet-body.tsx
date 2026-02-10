import type { AnySchema } from "@orama/orama"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { IntrospectionFacet, PinoramaIntrospection } from "pinorama-types"
import { useRef } from "react"
import type { FacetValue, SearchFilters } from "../types"
import { FacetItem } from "./facet-item"

type FacetBodyProps = {
  introspection: PinoramaIntrospection<AnySchema>
  name: string
  type: IntrospectionFacet
  values: FacetValue[]
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function FacetBody(props: FacetBodyProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: props.values.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38
  })

  return (
    <div
      ref={parentRef}
      className="border box-border rounded-md overflow-auto max-h-[241px] my-2"
    >
      <div
        className="w-full relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            className="absolute top-0 left-0 w-full"
            style={{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <FacetItem
              introspection={props.introspection}
              name={props.name}
              type={props.type}
              value={props.values[virtualItem.index].value}
              count={props.values[virtualItem.index].count}
              filters={props.filters}
              onFiltersChange={props.onFiltersChange}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
