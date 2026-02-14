import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { usePinoramaClient } from "@/contexts"

import { POLL_DELAY } from "@/modules/log-explorer/constants"
import type { SearchFilters } from "../types"

export type OramaFacetValue = {
  count: number
  values: Record<string | number, number>
}

export type FacetsData = Record<string, OramaFacetValue>

export const useFacets = (
  names: string[],
  searchText: string,
  filters: SearchFilters,
  liveMode: boolean,
  liveSessionStart: number,
  enabled = true
) => {
  const client = usePinoramaClient()

  const query = useQuery<FacetsData>({
    enabled: enabled && names.length > 0,
    queryKey: [
      "facets",
      names,
      searchText,
      filters,
      liveMode,
      liveSessionStart
    ],
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (signal.aborted) {
        return {}
      }

      const facets: Record<string, object> = {}
      for (const name of names) {
        facets[name] = {}
      }

      const payload: any = {
        preflight: true,
        facets
      }

      if (searchText) {
        payload.term = searchText
      }

      const where: any = { ...filters }

      if (liveMode && liveSessionStart > 0) {
        where["_pinorama.createdAt"] = { gte: liveSessionStart }
      }

      if (Object.keys(where).length > 0) {
        payload.where = where
      }

      const response: any = await client?.search(payload)
      return response.facets as FacetsData
    },
    placeholderData: keepPreviousData,
    refetchInterval: liveMode ? POLL_DELAY : false
  })

  return query
}
