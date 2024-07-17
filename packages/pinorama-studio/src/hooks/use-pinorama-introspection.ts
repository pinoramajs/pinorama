import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"

export const usePinoramaIntrospection = () => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["introspection", client],
    queryFn: async () => {
      const response: any = await client?.introspection()
      return response
    }
  })

  return query
}
