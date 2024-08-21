import { usePinoramaClient } from "@/contexts"
import type { AnySchema } from "@orama/orama"
import { useQuery } from "@tanstack/react-query"
import type { PinoramaIntrospection } from "pinorama-types"

export const usePinoramaIntrospection = () => {
  const client = usePinoramaClient()

  return useQuery({
    queryKey: ["introspection", client],
    queryFn: () =>
      client?.introspection() as Promise<PinoramaIntrospection<AnySchema>>,
    staleTime: Number.POSITIVE_INFINITY
  })
}
