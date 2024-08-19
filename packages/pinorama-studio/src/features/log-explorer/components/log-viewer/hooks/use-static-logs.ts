import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/features/log-explorer/utils"
import { useQuery } from "@tanstack/react-query"

import type { SearchFilters } from "../../log-filters/types"

export const useStaticLogs = (
  searchText?: string,
  searchFilters?: SearchFilters,
  enabled?: boolean
) => {
  const client = usePinoramaClient()

  return useQuery({
    queryKey: ["static-logs", searchText, searchFilters],
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (signal.aborted) return

      const payload = buildPayload(searchText, searchFilters)

      const response = await client?.search(payload)
      const newData = response?.hits.map((hit) => hit.document) ?? []

      return newData
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled
  })
}
