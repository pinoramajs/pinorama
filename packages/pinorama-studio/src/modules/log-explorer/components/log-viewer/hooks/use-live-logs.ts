import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"

import type { AnyOrama, SearchParams } from "@orama/orama"

const POLL_DELAY = 1500

export const useLiveLogs = <T extends AnyOrama>(
  searchText?: string,
  searchFilters?: SearchParams<T>["where"],
  enabled?: boolean
) => {
  const client = usePinoramaClient()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const query = useInfiniteQuery({
    queryKey: ["live-logs", searchText, searchFilters],
    queryFn: async ({ pageParam }) => {
      const payload = buildPayload(searchText, searchFilters, pageParam)

      const response = await client?.search(payload)
      const newData = response?.hits.map((hit) => hit.document) ?? []

      if (newData.length > 0) {
        const lastItem = newData[newData.length - 1]
        const metadata = lastItem._pinorama
        pageParam = metadata.createdAt
      }

      return { data: newData, nextCursor: pageParam }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Number.POSITIVE_INFINITY,
    // refetchInterval: POLL_DELAY, // NOTE: This is not working as expected, it doesn't use the nextCursor
    enabled: false
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
      query.fetchNextPage().finally(() => {
        schedulePoll()
      })
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
