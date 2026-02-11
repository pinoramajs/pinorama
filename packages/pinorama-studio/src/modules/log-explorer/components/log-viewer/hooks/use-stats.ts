import { useQuery } from "@tanstack/react-query"
import { usePinoramaClient } from "@/contexts"
import { STATS_POLL_INTERVAL } from "@/modules/log-explorer/constants"

export const useStats = () => {
  const client = usePinoramaClient()

  return useQuery({
    queryKey: ["stats"],
    queryFn: () => client?.stats(),
    refetchInterval: STATS_POLL_INTERVAL
  })
}
