import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { usePinoramaClient } from "@/contexts"

import { POLL_DELAY } from "@/modules/log-explorer/constants"
import type { SearchFilters } from "../types"

type OramaFacetValue = {
  count: number
  values: Record<string | number, number>
}

export const useFacet = (
  name: string,
  searchText: string,
  filters: SearchFilters,
  liveMode: boolean,
  liveSessionStart: number
) => {
  const client = usePinoramaClient()

  const query = useQuery<OramaFacetValue>({
    queryKey: ["facets", name, searchText, filters, liveMode, liveSessionStart],
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (signal.aborted) {
        return
      }

      const payload: any = {
        preflight: true,
        facets: { [name]: {} }
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
      return response.facets[name]
    },
    placeholderData: keepPreviousData,
    refetchInterval: liveMode ? POLL_DELAY : false
  })

  return query
}
