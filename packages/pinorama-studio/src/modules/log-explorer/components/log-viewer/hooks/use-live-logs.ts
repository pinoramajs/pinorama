import type { AnyOrama, SearchParams } from "@orama/orama"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { usePinoramaClient } from "@/contexts"
import {
  MAX_CONSECUTIVE_ERRORS,
  POLL_DELAY
} from "@/modules/log-explorer/constants"
import { buildPayload } from "@/modules/log-explorer/utils"

export const useLiveLogs = <T extends AnyOrama>(
  searchText?: string,
  searchFilters?: SearchParams<T>["where"],
  enabled?: boolean
) => {
  const client = usePinoramaClient()

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
    enabled: false
  })

  const fetchNextPageRef = useRef(query.fetchNextPage)
  fetchNextPageRef.current = query.fetchNextPage

  const isFetchingRef = useRef(false)
  const consecutiveErrorsRef = useRef(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset error counter when search criteria change
  useEffect(() => {
    consecutiveErrorsRef.current = 0
  }, [searchText, searchFilters])

  useEffect(() => {
    if (!enabled) return

    const poll = async () => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      try {
        await fetchNextPageRef.current()
        consecutiveErrorsRef.current = 0
      } catch {
        consecutiveErrorsRef.current += 1
        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
          clearInterval(intervalId)
        }
      } finally {
        isFetchingRef.current = false
      }
    }

    poll()
    const intervalId = setInterval(poll, POLL_DELAY)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled])

  const flattenedData = useMemo(() => {
    return (
      query.data?.pages
        .filter((page) => page.data.length > 0)
        .flatMap((page) => page.data) ?? []
    )
  }, [query.data])

  return { ...query, data: flattenedData }
}
