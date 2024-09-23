import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"
import { useMemo } from "react"
import { fetchTotalCount, getInfiniteQueryItemCount } from "../utils"

const BASE_QUERY_KEY = "static-logs"

type StaticLogsHookParams<T extends BaseOramaPinorama> = {
  term?: string
  filters?: SearchParams<T>["where"]
  enabled?: boolean
}

export const useStaticLogs = <T extends BaseOramaPinorama>({
  term,
  filters,
  enabled
}: StaticLogsHookParams<T>) => {
  const client = usePinoramaClient()
  const queryClient = useQueryClient()

  const queryKey = [BASE_QUERY_KEY, term, filters]

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
      if (newData.length > 0 && cachedCount + newData.length < totalCount) {
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
    staleTime: Number.POSITIVE_INFINITY,
    enabled
  })

  const flattenedData = useMemo(() => {
    return query.data?.pages.flatMap((page) => page?.data) ?? []
  }, [query.data])

  return { ...query, data: flattenedData }
}
