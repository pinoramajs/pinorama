import { usePinoramaClient } from "@/contexts"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useState } from "react"
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
  const [startDate, setStartDate] = useState<Date>(new Date())
  console.log("startDate", startDate)

  const query = useQuery<Record<string, OramaFacetValue>>({
    queryKey: ["facets", names, searchText, filters, liveMode],
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

      if (liveMode) {
        payload.where["_pinorama.createdAt"] = { gt: startDate.getTime() }
      }

      console.log("Fetching facets", payload)

      const response = await client?.search(payload)
      return response?.facets
    },
    placeholderData: keepPreviousData,
    refetchInterval: liveMode ? POLL_DELAY : false
  })

  return query
}
