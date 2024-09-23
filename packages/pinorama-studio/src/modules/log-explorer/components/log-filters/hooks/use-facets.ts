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
  liveModeAt: Date | null
) => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["facets", names, searchText, filters, liveModeAt],
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
      }

      if (filters) {
        payload.where = filters
      }

      if (liveModeAt) {
        payload.where["_pinorama.createdAt"] = { gt: liveModeAt.getTime() }
      }

      const response = await client?.search(payload)
      return response?.facets
    },
    // placeholderData: keepPreviousData,
    staleTime: Number.POSITIVE_INFINITY,
    refetchInterval: liveModeAt ? POLL_DELAY : false
  })

  return query
}
