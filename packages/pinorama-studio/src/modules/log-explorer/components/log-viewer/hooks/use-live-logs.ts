import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"
import {
  keepPreviousData,
  useQuery,
  useQueryClient
} from "@tanstack/react-query"
import { useCallback, useState } from "react"

import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"

const POLL_DELAY = 1500
const BASE_QUERY_KEY = "live-logs"

type LiveLogsHookParams<T extends BaseOramaPinorama> = {
  term?: string
  filters?: SearchParams<T>["where"]
  enabled?: boolean
}

export const useLiveLogs = <T extends BaseOramaPinorama>({
  term,
  filters,
  enabled
}: LiveLogsHookParams<T>) => {
  const client = usePinoramaClient()
  const queryClient = useQueryClient()

  const [startAt, setStartAt] = useState<Date | undefined>()
  const [cursor, setCursor] = useState<number | undefined>()

  const queryKey = [BASE_QUERY_KEY, term, filters, startAt]

  const _enabled = !!client && !!cursor && enabled

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      if (signal.aborted || !client) return []

      const cachedData = queryClient.getQueryData<T[]>(queryKey) ?? []

      const payload = buildPayload({
        term,
        filters,
        cursor,
        pageSize: 20_000
      })

      const response = await client.search(payload)
      const data = response?.hits.map((hit) => hit.document) ?? []

      if (data.length > 0) {
        const lastItem = data[data.length - 1]
        const nextCursor = lastItem._pinorama.createdAt
        setCursor(nextCursor)
      }

      const newData = [...cachedData, ...data]

      const logsSizeInMB =
        new TextEncoder().encode(JSON.stringify(newData)).length / (1024 * 1024)
      console.log(`Logs size: ${logsSizeInMB.toFixed(2)} MB`)

      return newData
    },
    refetchInterval: cursor ? POLL_DELAY : false,
    placeholderData: keepPreviousData,
    enabled: _enabled,
    staleTime: 0
  })

  const start = useCallback(
    (date: Date) => {
      if (_enabled) return
      queryClient.resetQueries({ queryKey: [BASE_QUERY_KEY] })
      setStartAt(date)
      setCursor(date.getTime())
    },
    [queryClient, _enabled]
  )

  const stop = useCallback(() => {
    if (!_enabled) return
    queryClient.resetQueries({ queryKey: [BASE_QUERY_KEY] })
    setCursor(undefined)
  }, [queryClient, _enabled])

  const reset = useCallback(() => {
    if (!_enabled) return
    console.log("Resetting query")
    queryClient.resetQueries({ queryKey: [BASE_QUERY_KEY] })
    setCursor(startAt?.getTime())
  }, [queryClient, _enabled, startAt])

  // useEffect(() => {
  //   if (_enabled) {
  //     console.log("Resetting cursor")
  //     setCursor(startAt?.getTime())
  //   }
  // }, [term, filters, _enabled, startAt])

  return { ...query, start, stop, reset }
}
