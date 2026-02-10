import type { AnySchema } from "@orama/orama"
import type { IntrospectionFacet, PinoramaIntrospection } from "pinorama-types"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { createField } from "@/lib/introspection"
import type { SearchFilters } from "../types"
import { FacetFactoryInput } from "./facet-factory-input"

type FacetItemProps = {
  introspection: PinoramaIntrospection<AnySchema>
  name: string
  type: IntrospectionFacet
  value: string | number
  count: number
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function FacetItem(props: FacetItemProps) {
  const field = createField(props.name, props.introspection)

  return (
    <div className="flex items-center space-x-3 h-[38px] px-3 border-b last:border-b-0 bg-muted/20">
      <FacetFactoryInput
        id={props.value as string}
        type={props.type}
        name={props.name}
        value={props.value}
        filters={props.filters}
        onFiltersChange={props.onFiltersChange}
      />
      <Label
        htmlFor={props.value as string}
        className="whitespace-nowrap text-muted-foreground font-normal cursor-pointer flex-grow text-ellipsis w-full overflow-hidden leading-tight"
      >
        {field.format(props.value)}
      </Label>
      <Badge
        variant={"secondary"}
        className="font-normal text-muted-foreground cursor-pointer"
      >
        {props.count}
      </Badge>
    </div>
  )
}
