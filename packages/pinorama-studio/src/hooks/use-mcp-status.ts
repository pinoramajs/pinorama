import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { PinoramaMcpStatus } from "pinorama-client/browser"
import { usePinoramaClient } from "@/contexts"
import { usePinoramaConnection } from "./use-pinorama-connection"

export function useMcpStatus() {
  const client = usePinoramaClient()
  const { isConnected } = usePinoramaConnection()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["mcp-status"],
    queryFn: () => client?.mcpStatus() as Promise<PinoramaMcpStatus>,
    enabled: isConnected && !!client,
    refetchInterval: 10_000
  })

  const mutation = useMutation({
    mutationFn: (enabled: boolean) =>
      client?.setMcpStatus(enabled) as Promise<PinoramaMcpStatus>,
    onSuccess: (data) => {
      queryClient.setQueryData<PinoramaMcpStatus>(["mcp-status"], data)
    }
  })

  return {
    enabled: query.data?.enabled ?? false,
    isLoading: query.isLoading,
    toggle: () => mutation.mutate(!query.data?.enabled),
    setEnabled: (enabled: boolean) => mutation.mutate(enabled)
  }
}
