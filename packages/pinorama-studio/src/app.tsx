import { Unplug } from "lucide-react"
import { useState } from "react"
import { useIntl } from "react-intl"
import { useConnectionToggle } from "./components/connection-toggle/connection-toggle"
import { EmptyStateBlock } from "./components/empty-state/empty-state"
import { LogExplorer } from "./components/log-explorer"
import type { SearchFilters } from "./components/log-explorer/components/log-filters/types"
import { TitleBar } from "./components/title-bar/title-bar"

function App() {
  const intl = useIntl()

  const { isConnected, toggleConnection } = useConnectionToggle()

  const [searchText, setSearchText] = useState<string>("")
  const [filters, setFilters] = useState<SearchFilters>({})

  const hasFilters = searchText.length > 0 || Object.keys(filters).length > 0

  const handleClearFilters = () => {
    setSearchText("")
    setFilters({})
  }

  return (
    <div className="h-screen w-full grid grid-rows-[48px_1fr]">
      {/* Header */}
      <TitleBar hasFilters={hasFilters} onClearFilters={handleClearFilters} />

      {/* Container */}
      {isConnected ? (
        <LogExplorer
          searchText={searchText}
          filters={filters}
          onSearchTextChange={setSearchText}
          onFiltersChange={setFilters}
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <EmptyStateBlock
          icon={Unplug}
          title={intl.formatMessage({ id: "state.notConnected.title" })}
          message={intl.formatMessage({ id: "state.notConnected.message" })}
          buttons={[
            {
              text: intl.formatMessage({ id: "state.notConnected.action" }),
              onClick: toggleConnection
            }
          ]}
        />
      )}
    </div>
  )
}

export default App
