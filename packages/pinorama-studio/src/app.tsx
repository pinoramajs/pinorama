import { useState } from "react"
import { LogExplorer } from "./components/log-explorer"
import type { SearchFilters } from "./components/log-explorer/components/log-filters/types"
import { TitleBar } from "./components/title-bar/title-bar"
import { useAppConfig } from "./contexts"

function App() {
  const appConfig = useAppConfig()

  const [searchText, setSearchText] = useState<string>("")
  const [filters, setFilters] = useState<SearchFilters>({})

  const hasFilters = searchText.length > 0 || Object.keys(filters).length > 0

  const handleResetFilters = () => {
    setSearchText("")
    setFilters({})
  }

  const isConnected = appConfig?.config.connectionStatus === "connected"

  return (
    <div className="h-screen w-full grid grid-rows-[48px_1fr]">
      {/* Header */}
      <TitleBar hasFilters={hasFilters} onResetFilters={handleResetFilters} />

      {/* Container */}
      {isConnected ? (
        <LogExplorer
          searchText={searchText}
          filters={filters}
          onSearchTextChange={setSearchText}
          onFiltersChange={setFilters}
        />
      ) : null}
    </div>
  )
}

export default App
