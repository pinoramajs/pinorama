import { usePinoramaClient } from "@/contexts"
import { buildPayload } from "@/modules/log-explorer/utils"
import type { SearchParams } from "@orama/orama"
import { useQuery } from "@tanstack/react-query"
import type { BaseOramaPinorama } from "pinorama-types"

export const useTotalLogs = <T extends BaseOramaPinorama>(
  term?: string,
  filters?: SearchParams<T>["where"]
) => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["totals", term, filters],
    queryFn: async () => {
      const payload = buildPayload({ term, filters, preflight: true })

      const response = await client?.search(payload)

      const totals = {
        instance: await client?.count(),
        filtered: response?.count ?? 0
      }

      return totals
    },
    refetchInterval: 5000
  })

  return query
}
