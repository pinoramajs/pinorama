import type { AnyOrama, SearchParams } from "@orama/orama"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { usePinoramaClient } from "@/contexts"
import {
  DEFAULT_PAGE_SIZE,
  LIVE_BUFFER_SIZE,
  POLL_DELAY
} from "@/modules/log-explorer/constants"
import { buildPayload } from "@/modules/log-explorer/utils"

export const useLiveLogs = <T extends AnyOrama>(
  searchText?: string,
  searchFilters?: SearchParams<T>["where"],
  enabled?: boolean,
  liveSessionStart?: number
) => {
  const client = usePinoramaClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (enabled && liveSessionStart) {
      queryClient.removeQueries({ queryKey: ["live-logs"] })
    }
  }, [enabled, liveSessionStart, queryClient])

  const query = useInfiniteQuery({
    queryKey: ["live-logs", searchText, searchFilters],
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam || liveSessionStart || Date.now()
      const payload = buildPayload(searchText, searchFilters, { cursor })

      const response = await client?.search(payload)
      const newData = response?.hits.map((hit) => hit.document) ?? []

      let nextCursor = cursor
      if (newData.length > 0) {
        const lastItem = newData[newData.length - 1]
        nextCursor = lastItem._pinorama.createdAt
      }

      return { data: newData, nextCursor }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    maxPages: Math.ceil(LIVE_BUFFER_SIZE / DEFAULT_PAGE_SIZE),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: false
  })

  const fetchNextPageRef = useRef(query.fetchNextPage)
  fetchNextPageRef.current = query.fetchNextPage

  const isFetchingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const poll = async () => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      const result = await fetchNextPageRef.current()
      isFetchingRef.current = false

      if (result.isError) {
        clearInterval(intervalId)
      }
    }

    poll()
    const intervalId = setInterval(poll, POLL_DELAY)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled])

  const flattenedData = useMemo(() => {
    const all =
      query.data?.pages
        .filter((page) => page.data.length > 0)
        .flatMap((page) => page.data) ?? []

    if (all.length > LIVE_BUFFER_SIZE) {
      return all.slice(all.length - LIVE_BUFFER_SIZE)
    }

    return all
  }, [query.data])

  return {
    ...query,
    data: flattenedData,
    bufferCount: flattenedData.length,
    bufferMax: LIVE_BUFFER_SIZE
  }
}
