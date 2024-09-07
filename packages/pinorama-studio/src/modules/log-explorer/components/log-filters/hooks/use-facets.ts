import { usePinoramaClient } from "@/contexts"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { SearchFilters } from "../types"

export type OramaFacetValue = {
  count: number
  values: Record<string | number, number>
}

const POLL_DELAY = 1500

export const useFacets = (
  names: string[],
  searchText: string,
  filters: SearchFilters,
  liveMode: boolean
) => {
  const client = usePinoramaClient()

  const query = useQuery<Record<string, OramaFacetValue>>({
    queryKey: ["facets", names, searchText, filters],
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (signal.aborted) {
        return
      }

      const payload: any = {
        preflight: true,
        facets: names.reduce(
          (acc, name) => {
            acc[name] = {}
            return acc
          },
          {} as Record<string, object>
        )
      }

      if (searchText) {
        payload.term = searchText
        // payload.properties = [name]
      }

      if (filters) {
        payload.where = filters
      }

      const response: any = await client?.search(payload)
      return response.facets
    },
    placeholderData: keepPreviousData,
    refetchInterval: liveMode ? POLL_DELAY : false
  })

  return query
}
