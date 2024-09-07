import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"
import { useInfiniteQuery } from "@tanstack/react-query"

import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"
import { useMemo } from "react"

export const useStaticLogs = <T extends BaseOramaPinorama>(
  totals: number,
  term?: string,
  filters?: SearchParams<T>["where"],
  enabled?: boolean
) => {
  const client = usePinoramaClient()

  const query = useInfiniteQuery({
    queryKey: ["static-logs", totals, term, filters],
    queryFn: async ({ pageParam: cursor }) => {
      // await new Promise((resolve) => setTimeout(resolve, 300))
      // if (signal.aborted) return

      const payload = buildPayload({ term, filters, cursor })

      const response = await client?.search(payload)
      const newData = response?.hits.map((hit) => hit.document) ?? []

      if (newData.length > 0) {
        const lastItem = newData[newData.length - 1]
        const metadata = lastItem._pinorama
        cursor = metadata.createdAt
      }

      return {
        data: newData,
        nextCursor: cursor
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: Number.POSITIVE_INFINITY,
    enabled
  })

  const flattenedData = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data) ?? []
  }, [query.data])

  return { ...query, data: flattenedData }
}
