import type { AnySchema } from "@orama/orama"
import type { Table } from "@tanstack/react-table"
import { ListChecksIcon } from "lucide-react"
import type { PinoramaIntrospection } from "pinorama-types"
import { FormattedMessage, useIntl } from "react-intl"
import { IconButton } from "@/components/icon-button/icon-button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { createField } from "@/lib/introspection"

type ToggleColumnsButtonProps = {
  introspection: PinoramaIntrospection<AnySchema>
  table: Table<unknown>
}

export function ToggleColumnsButton(props: ToggleColumnsButtonProps) {
  const intl = useIntl()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton
          icon={ListChecksIcon}
          tooltip={intl.formatMessage({ id: "logExplorer.columns" })}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        {props.table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            const field = createField(column.id, props.introspection)
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
