import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"

export const useDocs = () => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["docs"],
    queryFn: async () => {
      const response: any = await client?.search({
        limit: 100
      })
      return response.hits.map((hit: { document: unknown }) => hit.document)
    }
  })

  return query
}
