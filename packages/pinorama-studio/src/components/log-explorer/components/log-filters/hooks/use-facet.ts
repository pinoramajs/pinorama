import { usePinoramaClient } from "@/contexts"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { SearchFilters } from "../types"

type OramaFacetValue = {
  count: number
  values: Record<string | number, number>
}

export const useFacet = (
  name: string,
  searchText: string,
  filters: SearchFilters
) => {
  const client = usePinoramaClient()

  const query = useQuery<OramaFacetValue>({
    queryKey: ["facets", name, searchText, filters],
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
        // payload.properties = [name]
      }

      if (filters) {
        payload.where = filters
      }

      const response: any = await client?.search(payload)
      return response.facets[name]
    },
    placeholderData: keepPreviousData,
    refetchInterval: 3000
  })

  return query
}
