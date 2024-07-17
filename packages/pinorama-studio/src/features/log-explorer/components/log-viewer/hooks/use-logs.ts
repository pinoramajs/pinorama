import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"

import type { SearchFilters } from "../../log-filters/types"

export const useLogs = (searchText?: string, filters?: SearchFilters) => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["logs", searchText, filters],
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (signal.aborted) {
        return
      }

      const payload: any = {
        limit: 10000
      }

      if (searchText) {
        payload.term = searchText
      }

      if (filters) {
        payload.where = filters
      }

      const response: any = await client?.search(payload)

      return response.hits.map((hit: { document: unknown }) => hit.document)
    }
    // refetchInterval: 3000
  })

  return query
}
