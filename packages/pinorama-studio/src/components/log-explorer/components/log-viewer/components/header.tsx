import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import type { Table } from "@tanstack/react-table"
import { EllipsisVertical, Search, SlidersVertical } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"
import type { SearchFilters } from "../../log-filters/types"

type LogViewerHeaderProps = {
  table: Table<unknown>
  searchText: string
  filters: SearchFilters
  filtersPanelCollapsed: boolean
  onSearchTextChange: (text: string) => void
  onFiltersPanelToggle: () => void
}

export function LogViewerHeader(props: LogViewerHeaderProps) {
  const intl = useIntl()

  return (
    <div className="flex items-center p-3 pb-1 bg-background space-x-1.5">
      <ToggleFiltersButton
        onClick={props.onFiltersPanelToggle}
        isPanelCollapsed={props.filtersPanelCollapsed}
      />
      <div className="relative flex items-center w-full">
        <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
        <Input
          type="text"
          placeholder={intl.formatMessage({ id: "labels.searchLogs" })}
          className="pl-9"
          value={props.searchText}
          onChange={(e) => props.onSearchTextChange(e.target.value)}
        />
      </div>
      <ColumnsButton table={props.table} />
    </div>
  )
}

type ToggleFiltersButtonProps = {
  onClick: () => void
  isPanelCollapsed: boolean
}

function ToggleFiltersButton(props: ToggleFiltersButtonProps) {
  const label = props.isPanelCollapsed ? "show" : "hide"

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          aria-label={label}
          variant="outline2"
          className="px-2.5"
          onClick={props.onClick}
        >
          <SlidersVertical className="h-[18px] w-[18px]" />
        </Button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>
          <FormattedMessage id={`filters.${label}`} />
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  )
}

type ColumnsVisibilityButtonProps = {
  table: Table<unknown>
}

function ColumnsButton(props: ColumnsVisibilityButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Tooltip>
          <TooltipTrigger>
            <Button aria-label="Columns" variant="outline2" className="px-2.5">
              <EllipsisVertical className="h-[18px] w-[18px]" />
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              <FormattedMessage id="columns" />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel>
          <FormattedMessage id="columns.toggle" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {props.table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                disabled={
                  column.getIsVisible() &&
                  props.table.getVisibleFlatColumns().length === 1
                }
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => props.table.resetColumnVisibility()}>
          <FormattedMessage id="columns.reset" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
