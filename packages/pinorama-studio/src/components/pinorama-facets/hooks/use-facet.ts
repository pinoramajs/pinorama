import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"

export const useFacet = (property: string, searchText?: string) => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["facets", property],
    queryFn: async () => {
      const payload: any = {
        preflight: true,
        facets: { [property]: {} }
      }

      if (searchText) {
        payload.term = searchText
        payload.properties = [property]
      }

      const response: any = await client?.search(payload)
      return response.facets[property]
    }
  })

  return query
}
