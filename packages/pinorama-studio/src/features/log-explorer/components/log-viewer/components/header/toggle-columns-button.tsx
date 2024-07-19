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
import { usePinoramaConnection } from "@/hooks"
import { createField } from "@/lib/introspection"
import type { Table } from "@tanstack/react-table"
import { EllipsisVerticalIcon } from "lucide-react"
import { FormattedMessage, useIntl } from "react-intl"

type ColumnsVisibilityButtonProps = {
  table: Table<unknown>
}

export function ToggleColumnsButton(props: ColumnsVisibilityButtonProps) {
  const { introspection } = usePinoramaConnection()

  const intl = useIntl()
  const label = intl.formatMessage({ id: "logExplorer.columnsVisibility" })
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={label} variant="outline2" className="px-2.5">
          <EllipsisVerticalIcon className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel>
          <FormattedMessage id="logExplorer.columnsVisibility" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {props.table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            const field = createField(column.id, introspection)
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
                {field.getDisplayLabel()}
              </DropdownMenuCheckboxItem>
            )
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => props.table.resetColumnVisibility()}>
          <FormattedMessage id="logExplorer.resetColumns" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
