import type { AnySchema } from "@orama/orama"
import type { Table } from "@tanstack/react-table"
import {
  FilterIcon,
  FilterXIcon,
  PanelRightIcon,
  RefreshCwIcon,
  Trash2Icon
} from "lucide-react"
import type { PinoramaIntrospection } from "pinorama-types"
import { useIntl } from "react-intl"
import { IconButton } from "@/components/icon-button/icon-button"
import { SearchInput } from "@/components/search-input"
import { useModuleHotkeys } from "@/hooks/use-module-hotkeys"
import LogExplorerModule from "@/modules/log-explorer"
import { ToggleColumnsButton } from "./toggle-columns-button"
import { ToggleLiveButton } from "./toggle-live-button"

type LogViewerHeaderProps = {
  searchInputRef: React.RefObject<HTMLInputElement | null>
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
  onClearLogsButtonClick: () => void
  onToggleDetailsButtonClick: () => void
}

export function LogViewerHeader(props: LogViewerHeaderProps) {
  const intl = useIntl()
  const moduleHotkeys = useModuleHotkeys(LogExplorerModule)

  const hotkeys = {
    showFilters: moduleHotkeys.getHotkey("showFilters"),
    refresh: moduleHotkeys.getHotkey("refresh"),
    clearFilters: moduleHotkeys.getHotkey("clearFilters"),
    showDetails: moduleHotkeys.getHotkey("showDetails")
  }

  return (
    <div className="flex items-center p-3 pb-1 bg-background space-x-1.5">
      <IconButton
        aria-label={hotkeys.showFilters?.description}
        tooltip={hotkeys.showFilters?.description}
        keystroke={hotkeys.showFilters?.keystroke}
        icon={FilterIcon}
        onClick={props.onToggleFiltersButtonClick}
      />
      <SearchInput
        ref={props.searchInputRef}
        placeholder={intl.formatMessage({ id: "logExplorer.searchLogs" })}
        keystroke={moduleHotkeys.getHotkey("focusSearch")?.keystroke}
        value={props.searchText}
        onChange={props.onSearchTextChange}
      />
      <ToggleLiveButton
        pressed={props.liveMode}
        onPressedChange={props.onToggleLiveButtonClick}
      />
      {props.liveMode ? (
        <IconButton
          aria-label={intl.formatMessage({ id: "logExplorer.clearLogs" })}
          tooltip={intl.formatMessage({ id: "logExplorer.clearLogs" })}
          icon={Trash2Icon}
          onClick={props.onClearLogsButtonClick}
        />
      ) : (
        <IconButton
          aria-label={hotkeys.refresh?.description}
          tooltip={hotkeys.refresh?.description}
          keystroke={hotkeys.refresh?.keystroke}
          icon={RefreshCwIcon}
          onClick={props.onRefreshButtonClick}
          loading={props.isLoading}
        />
      )}
      {props.showClearFiltersButton ? (
        <IconButton
          aria-label={hotkeys.clearFilters?.description}
          tooltip={hotkeys.clearFilters?.description}
          keystroke={hotkeys.clearFilters?.keystroke}
          icon={FilterXIcon}
          onClick={props.onClearFiltersButtonClick}
        />
      ) : null}
      <ToggleColumnsButton
        table={props.table}
        introspection={props.introspection}
      />
      <IconButton
        aria-label={hotkeys.showDetails?.description}
        tooltip={hotkeys.showDetails?.description}
        keystroke={hotkeys.showDetails?.keystroke}
        icon={PanelRightIcon}
        onClick={props.onToggleDetailsButtonClick}
      />
    </div>
  )
}
