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
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger
} from "@/components/ui/tooltip"
import type { Table } from "@tanstack/react-table"
import { EllipsisVerticalIcon } from "lucide-react"
import { FormattedMessage } from "react-intl"

type ColumnsVisibilityButtonProps = {
  table: Table<unknown>
}

export function ToggleColumnsButton(props: ColumnsVisibilityButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Tooltip>
          <TooltipTrigger>
            <Button aria-label="Columns" variant="outline2" className="px-2.5">
              <EllipsisVerticalIcon className="h-[18px] w-[18px]" />
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
