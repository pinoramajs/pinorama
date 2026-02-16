import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"

import type { SearchFilters } from "../../log-filters/types"

export const useStaticLogs = (
  searchText?: string,
  searchFilters?: SearchFilters,
  enabled?: boolean,
  page = 0,
  pageSize = 500,
  searchProperties?: string[]
) => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: [
      "static-logs",
      searchText,
      searchFilters,
      page,
      pageSize,
      searchProperties
    ],
    queryFn: async () => {
      const offset = page * pageSize
      const payload = buildPayload(searchText, searchFilters, {
        limit: pageSize,
        offset,
        searchProperties
      })

      const response = await client?.search(payload)
      const newData = response?.hits.map((hit) => hit.document) ?? []
      const totalCount = response?.count ?? 0

      return { data: newData, totalCount }
    },
    staleTime: Number.POSITIVE_INFINITY,
    placeholderData: keepPreviousData,
    enabled
  })

  return {
    ...query,
    data: query.data?.data ?? [],
    totalCount: query.data?.totalCount ?? 0
  }
}
