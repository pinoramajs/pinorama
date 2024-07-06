import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight, CircleX, LoaderIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useFacet } from "../hooks/use-facet"
import { facetFilterOperationsFactory } from "../lib/operations"
import type {
  FacetFilter,
  FacetValue,
  OramaPropType,
  SearchFilters
} from "../types"
import { FacetFactoryInput } from "./facet-factory-input"

type FacetProps = {
  name: string
  type: OramaPropType
  searchText: string
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function Facet(props: FacetProps) {
  const [open, setOpen] = useState(true)
  const { data: facet, fetchStatus } = useFacet(
    props.name,
    props.searchText,
    props.filters
  )

  const operations: any = facetFilterOperationsFactory(props.type)
  const criteria = props.filters[props.name] || operations.create()
  const selelectedOptionCount = operations.length(criteria)

  const handleReset = useCallback(() => {
    const filters = { ...props.filters }
    delete filters[props.name]
    props.onFiltersChange(filters)
  }, [props.onFiltersChange, props.name, props.filters])

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

  const ChevronIcon = open ? ChevronDown : ChevronRight

  return (
    <div>
      <Button
        variant={"ghost"}
        onClick={() => setOpen((value) => !value)}
        className={`w-full text-left justify-between text-sm font-normal px-2 ${open ? "hover:bg-transparent" : "text-muted-foreground"}`}
      >
        <div className="flex items-center">
          <ChevronIcon className="mr-2 w-5 h-5" />
          {props.name}
          {fetchStatus === "fetching" ? (
            <LoaderIcon className="w-4 h-4 ml-2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        {selelectedOptionCount > 0 ? (
          <div>
            <Button
              variant={"outline"}
              size={"badge"}
              className="flex text-muted-foreground"
              onClick={handleReset}
            >
              <CircleX className="w-4 h-4" />
              <div className="px-1.5 text-xs">
                {selelectedOptionCount as string}
              </div>
            </Button>
          </div>
        ) : null}
      </Button>
      {open ? (
        <div className="my-2">
          <div className="border border-muted rounded-md overflow-auto max-h-[241px] my-2">
            {values?.map(({ value, count }) => {
              return (
                <div
                  key={value}
                  className="flex items-center space-x-3 h-10 px-3 border-b last:border-b-0"
                >
                  <FacetFactoryInput
                    id={value as string}
                    type={props.type}
                    name={props.name}
                    value={value}
                    filters={props.filters}
                    onFiltersChange={props.onFiltersChange}
                  />
                  <Label
                    htmlFor={value as string}
                    className="whitespace-nowrap text-muted-foreground font-normal cursor-pointer flex-grow text-ellipsis w-full overflow-hidden leading-tight"
                  >
                    {value}
                  </Label>
                  <Badge
                    variant={"secondary"}
                    className="font-normal text-muted-foreground cursor-pointer"
                  >
                    {count}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
