import type { SearchFilters } from "@/components/pinorama-facets/types"
import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"

export const useDocs = (searchText?: string, filters?: SearchFilters) => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["docs", searchText, filters],
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
  })

  return query
}
