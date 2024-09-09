import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"
import { useMemo } from "react"
import { fetchTotalCount, getInfiniteQueryItemCount } from "../utils"

export const useStaticLogs = <T extends BaseOramaPinorama>(
  term?: string,
  filters?: SearchParams<T>["where"],
  enabled?: boolean
) => {
  const client = usePinoramaClient()
  const queryClient = useQueryClient()

  const queryKey = ["static-logs", term, filters]

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam, signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      if (signal.aborted) return

      const payload = buildPayload({ term, filters, cursor: pageParam })

      const response = await client?.search(payload)
      const newData = response?.hits.map((hit) => hit.document) ?? []

      const cachedCount = getInfiniteQueryItemCount(queryClient, queryKey)
      const totalCount = await fetchTotalCount(client, term, filters)

      let cursor: number | undefined = undefined
      if (cachedCount + newData.length < totalCount) {
        const lastItem = newData[newData.length - 1]
        cursor = lastItem._pinorama.createdAt
      }

      return {
        data: newData,
        nextCursor: cursor
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    // staleTime: 0,
    enabled
  })

  const flattenedData = useMemo(() => {
    return query.data?.pages.flatMap((page) => page?.data) ?? []
  }, [query.data])

  return { ...query, data: flattenedData }
}
