import { SearchInput } from "@/components/search-input"
import { useIntl } from "react-intl"
import { ClearFiltersButton } from "./clear-filters-button"
import { ToggleColumnsButton } from "./toggle-columns-button"
import { ToggleFiltersButton } from "./toggle-filters-button"
import { ToggleLiveButton } from "./toggle-live-button"

import type { AnySchema } from "@orama/orama"
import type { Table } from "@tanstack/react-table"
import type { PinoramaIntrospection } from "pinorama-types"
import { RefreshDataButton } from "./refresh-data-button"

type LogViewerHeaderProps = {
  introspection: PinoramaIntrospection<AnySchema>
  table: Table<unknown>
  searchText: string
  showClearFiltersButton: boolean
  liveMode: boolean
  isLoading: boolean
  onSearchTextChange: (text: string) => void
  onToggleFiltersButtonClick: () => void
  onClearFiltersButtonClick: () => void
  onToggleLiveButtonClick: (live: boolean) => void
  onRefreshButtonClick: () => void
}

export function LogViewerHeader(props: LogViewerHeaderProps) {
  const intl = useIntl()

  return (
    <div className="flex items-center p-3 pb-1 bg-background space-x-1.5">
      <ToggleFiltersButton onClick={props.onToggleFiltersButtonClick} />
      <SearchInput
        placeholder={intl.formatMessage({
          id: "logExplorer.searchLogs"
        })}
        value={props.searchText}
        onChange={props.onSearchTextChange}
      />
      <ToggleLiveButton
        pressed={props.liveMode}
        onPressedChange={props.onToggleLiveButtonClick}
      />
      <RefreshDataButton
        onClick={props.onRefreshButtonClick}
        loading={props.isLoading}
      />
      {props.showClearFiltersButton ? (
        <ClearFiltersButton onClick={props.onClearFiltersButtonClick} />
      ) : null}
      <ToggleColumnsButton
        table={props.table}
        introspection={props.introspection}
      />
    </div>
  )
}
