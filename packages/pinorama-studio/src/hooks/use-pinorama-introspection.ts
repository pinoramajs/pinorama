import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"

export const usePinoramaIntrospection = () => {
  const client = usePinoramaClient()

  return useQuery({
    queryKey: ["introspection", client],
    queryFn: () => client?.introspection<any>(),
    staleTime: Number.POSITIVE_INFINITY
  })
}
