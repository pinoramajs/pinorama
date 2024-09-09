import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"

import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"
import { fetchTotalCount, getInfiniteQueryItemCount } from "../utils"

const POLL_DELAY = 1500

export const useLiveLogs = <T extends BaseOramaPinorama>(
  term?: string,
  filters?: SearchParams<T>["where"],
  enabled?: boolean
) => {
  const client = usePinoramaClient()
  const queryClient = useQueryClient()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const queryKey = ["live-logs", term, filters]

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const payload = buildPayload({ term, filters, cursor: pageParam })

      const response = await client?.search(payload)
      const newData = response?.hits.map((hit) => hit.document) ?? []

      const cachedCount = getInfiniteQueryItemCount(queryClient, queryKey)
      const totalCount = await fetchTotalCount(client, term, filters)

      if (newData.length > 0 && cachedCount + newData.length < totalCount) {
        const lastItem = newData[newData.length - 1]
        pageParam = lastItem._pinorama.createdAt
      }

      return {
        data: newData,
        nextCursor: pageParam
      }
    },
    initialPageParam: new Date().getTime() - 1000 * 60 * 60 * 24,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Number.POSITIVE_INFINITY,
    // refetchInterval: POLL_DELAY, // NOTE: This is not working as expected, it doesn't use the nextCursor
    enabled
  })

  const schedulePoll = useCallback(() => {
    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        query.fetchNextPage().finally(schedulePoll)
      }, POLL_DELAY)
    }
  }, [enabled, query.fetchNextPage])

  useEffect(() => {
    if (enabled) {
      query.fetchNextPage().finally(schedulePoll)
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, query.fetchNextPage, schedulePoll])

  const flattenedData = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data) ?? []
  }, [query.data])

  return { ...query, data: flattenedData }
}
