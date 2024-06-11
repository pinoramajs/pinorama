import { usePinoramaClient } from "@/components/pinorama-client-provider"
import { useQuery } from "@tanstack/react-query"

export const useLogs = () => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const response: any = await client?.search({})
      response.json()
    }
  })

  return query
}
