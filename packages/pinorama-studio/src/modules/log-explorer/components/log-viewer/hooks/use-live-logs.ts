import type { AnyOrama, SearchParams } from "@orama/orama"
import { useCallback, useEffect, useRef, useState } from "react"
import { usePinoramaClient } from "@/contexts"
import { LIVE_BUFFER_SIZE, POLL_DELAY } from "@/modules/log-explorer/constants"
import { buildPayload } from "@/modules/log-explorer/utils"

type LiveLogsStatus = "pending" | "success" | "error"

export const useLiveLogs = <T extends AnyOrama>(
  searchText?: string,
  searchFilters?: SearchParams<T>["where"],
  enabled?: boolean,
  liveSessionStart?: number
) => {
  const client = usePinoramaClient()
  const cursorRef = useRef(0)
  const dataRef = useRef<any[]>([])
  const isFetchingRef = useRef(false)

  const [data, setData] = useState<any[]>([])
  const [status, setStatus] = useState<LiveLogsStatus>("success")
  const [error, setError] = useState<Error | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey intentionally triggers a restart
  useEffect(() => {
    if (!enabled) return

    cursorRef.current = liveSessionStart || Date.now()
    dataRef.current = []
    setData([])
    setStatus("pending")
    setError(null)

    let intervalId: ReturnType<typeof setInterval>

    const poll = async () => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setIsFetching(true)

      try {
        const payload = buildPayload(searchText, searchFilters, {
          cursor: cursorRef.current
        })
        const response = await client?.search(payload)
        const newItems = response?.hits.map((hit) => hit.document) ?? []

        if (newItems.length > 0) {
          const lastItem = newItems[newItems.length - 1]
          cursorRef.current = lastItem._pinorama.createdAt

          let combined = [...dataRef.current, ...newItems]
          if (combined.length > LIVE_BUFFER_SIZE) {
            combined = combined.slice(combined.length - LIVE_BUFFER_SIZE)
          }
          dataRef.current = combined
          setData(combined)
        }

        setStatus("success")
        setError(null)
      } catch (err) {
        setStatus("error")
        setError(err instanceof Error ? err : new Error(String(err)))
        clearInterval(intervalId)
      } finally {
        isFetchingRef.current = false
        setIsFetching(false)
      }
    }

    poll()
    intervalId = setInterval(poll, POLL_DELAY)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, searchText, searchFilters, liveSessionStart, client, refreshKey])

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return {
    data,
    status,
    error,
    isFetching,
    refetch,
    bufferCount: data.length,
    bufferMax: LIVE_BUFFER_SIZE
  }
}
