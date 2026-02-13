import {
  ArrowDown01Icon,
  Calendar03Icon,
  Cancel01Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useIntl } from "react-intl"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import type { DateFilter, SearchFilters } from "../types"

type DateFacetBodyProps = {
  name: string
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
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

type DateTimeFieldProps = {
  placeholder: string
  value?: number
  onChange: (ms?: number) => void
}

function DateTimeField({ placeholder, value, onChange }: DateTimeFieldProps) {
  const intl = useIntl()
  const [open, setOpen] = useState(false)
  const [localDate, setLocalDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  useEffect(() => {
    setLocalDate(value ? new Date(value) : undefined)
  }, [value])

  const handleDateSelect = (selected: Date | undefined) => {
    if (!selected) {
      setLocalDate(undefined)
      return
    }
    const d = new Date(selected)
    if (localDate) {
      d.setHours(
        localDate.getHours(),
        localDate.getMinutes(),
        localDate.getSeconds(),
        0
      )
    }
    setLocalDate(d)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value
    if (!timeStr) return
    const parts = timeStr.split(":").map(Number)
    const [hours, minutes, seconds] = parts
    const d = localDate ? new Date(localDate) : new Date()
    if (!localDate) {
      d.setMilliseconds(0)
    }
    d.setHours(hours, minutes, seconds || 0)
    setLocalDate(d)
  }

  const handleApply = () => {
    onChange(localDate?.getTime())
    setOpen(false)
  }

  const handleClear = () => {
    onChange(undefined)
  }

  const isDirty = localDate?.getTime() !== value

  return (
    <ButtonGroup className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="flex-1 min-w-0 justify-start font-normal"
            />
          }
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            strokeWidth={2}
            className="text-muted-foreground"
          />
          <span className="flex-1 truncate text-left">
            {value ? (
              format(value, "MMM d, yyyy HH:mm:ss")
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="text-muted-foreground"
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          side="right"
          align="start"
        >
          <Calendar
            mode="single"
            selected={localDate}
            onSelect={handleDateSelect}
            defaultMonth={localDate}
          />
          <div className="space-y-3 border-t p-3">
            <Input
              type="time"
              step="1"
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              value={localDate ? format(localDate, "HH:mm:ss") : "00:00:00"}
              onChange={handleTimeChange}
            />
            <Button
              variant="outline"
              className="w-full"
              disabled={!isDirty}
              onClick={handleApply}
            >
              {intl.formatMessage({ id: "labels.apply" })} ↵
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {value != null && (
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleClear}
          aria-label="Clear"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            className="text-muted-foreground"
          />
        </Button>
      )}
    </ButtonGroup>
  )
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

  const updateFilter = (from?: number, to?: number) => {
    const newFilters = { ...filters }
    const dateFilter = buildDateFilter(from, to)

    if (dateFilter) {
      newFilters[name] = dateFilter
    } else {
      delete newFilters[name]
    }

    onFiltersChange(newFilters)
  }

  const handleFromChange = (ms?: number) => {
    updateFilter(ms, currentTo)
  }

  const handleToChange = (ms?: number) => {
    updateFilter(currentFrom, ms)
  }

  return (
    <div className="my-2 space-y-2">
      <DateTimeField
        placeholder={intl.formatMessage({ id: "labels.dateFrom" })}
        value={currentFrom}
        onChange={handleFromChange}
      />
      <DateTimeField
        placeholder={intl.formatMessage({ id: "labels.dateTo" })}
        value={currentTo}
        onChange={handleToChange}
      />
    </div>
  )
}
