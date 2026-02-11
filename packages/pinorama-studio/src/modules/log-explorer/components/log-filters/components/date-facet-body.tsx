import { format } from "date-fns"
import { useCallback, useMemo } from "react"
import { useIntl } from "react-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DateFilter, SearchFilters } from "../types"

type DateFacetBodyProps = {
  name: string
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

const toDatetimeLocal = (ms?: number) => {
  if (!ms) return ""
  return format(new Date(ms), "yyyy-MM-dd'T'HH:mm")
}

const fromDatetimeLocal = (value: string): number | undefined => {
  if (!value) return undefined
  return new Date(value).getTime()
}

const getFromMs = (filter: DateFilter | undefined): number | undefined => {
  if (!filter) return undefined
  if ("between" in filter) return filter.between[0]
  if ("gte" in filter) return filter.gte
  return undefined
}

const getToMs = (filter: DateFilter | undefined): number | undefined => {
  if (!filter) return undefined
  if ("between" in filter) return filter.between[1]
  if ("lte" in filter) return filter.lte
  return undefined
}

const buildDateFilter = (
  from?: number,
  to?: number
): DateFilter | undefined => {
  if (from && to) return { between: [from, to] }
  if (from) return { gte: from }
  if (to) return { lte: to }
  return undefined
}

export function DateFacetBody({
  name,
  filters,
  onFiltersChange
}: DateFacetBodyProps) {
  const intl = useIntl()
  const current = filters[name] as DateFilter | undefined

  const currentFrom = getFromMs(current)
  const currentTo = getToMs(current)

  const fromValue = useMemo(() => toDatetimeLocal(currentFrom), [currentFrom])
  const toValue = useMemo(() => toDatetimeLocal(currentTo), [currentTo])

  const updateFilter = useCallback(
    (from?: number, to?: number) => {
      const newFilters = { ...filters }
      const dateFilter = buildDateFilter(from, to)

      if (dateFilter) {
        newFilters[name] = dateFilter
      } else {
        delete newFilters[name]
      }

      onFiltersChange(newFilters)
    },
    [filters, name, onFiltersChange]
  )

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFilter(fromDatetimeLocal(e.target.value), currentTo)
    },
    [updateFilter, currentTo]
  )

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFilter(currentFrom, fromDatetimeLocal(e.target.value))
    },
    [updateFilter, currentFrom]
  )

  return (
    <div className="border rounded-md p-3 my-2 space-y-2">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          {intl.formatMessage({ id: "labels.from" })}
        </Label>
        <Input
          type="datetime-local"
          className="h-8 text-xs"
          value={fromValue}
          onChange={handleFromChange}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          {intl.formatMessage({ id: "labels.to" })}
        </Label>
        <Input
          type="datetime-local"
          className="h-8 text-xs"
          value={toValue}
          onChange={handleToChange}
        />
      </div>
    </div>
  )
}
