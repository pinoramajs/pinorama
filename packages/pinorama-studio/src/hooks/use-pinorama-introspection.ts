import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"

export const usePinoramaIntrospection = () => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["introspection"],
    queryFn: async () => {
      const response: any = await client?.introspection()
      return response
    },
    enabled: !!client,
    staleTime: Number.POSITIVE_INFINITY
  })

  return query
}
