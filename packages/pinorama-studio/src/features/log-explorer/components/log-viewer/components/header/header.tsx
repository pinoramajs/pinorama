import { SearchInput } from "@/components/search-input"
import { useIntl } from "react-intl"
import { ClearFiltersButton } from "./clear-filters-button"
import { ToggleColumnsButton } from "./toggle-columns-button"
import { ToggleFiltersButton } from "./toggle-filters-button"

import type { Table } from "@tanstack/react-table"

type LogViewerHeaderProps = {
  table: Table<unknown>
  searchText: string
  showClearFiltersButton: boolean
  onSearchTextChange: (text: string) => void
  onToggleFiltersButtonClick: () => void
  onClearFiltersButtonClick: () => void
}

export function LogViewerHeader(props: LogViewerHeaderProps) {
  const intl = useIntl()

  return (
    <div className="flex items-center p-3 pb-1 bg-background space-x-1.5">
      <ToggleFiltersButton onClick={props.onToggleFiltersButtonClick} />
      <SearchInput
        placeholder={intl.formatMessage({ id: "labels.searchLogs" })}
        value={props.searchText}
        onChange={props.onSearchTextChange}
      />
      {props.showClearFiltersButton ? (
        <ClearFiltersButton onClick={props.onClearFiltersButtonClick} />
      ) : null}
      <ToggleColumnsButton table={props.table} />
    </div>
  )
}
