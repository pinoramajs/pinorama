import { usePinoramaClient } from "@/components/pinorama-client-provider"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

export const usePinoramaDocs = () => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["docs"],
    queryFn: async () => {
      const response: any = await client?.search({
        limit: 200000
      })
      return response.hits.map((hit: { document: unknown }) => hit.document)
    }
  })

  return query
}

export const usePinoramaStyles = () => {
  const client = usePinoramaClient()

  const query = useQuery({
    queryKey: ["styles"],
    queryFn: async () => {
      const response: any = await client?.styles()
      return response
    },
    enabled: !!client,
    staleTime: Number.POSITIVE_INFINITY
  })

  useEffect(() => {
    if (!query.data) return

    let styleElement = document.getElementById(
      "pinorama-styles"
    ) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement("style")
      styleElement.id = "pinorama-styles"
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = query.data
  }, [query.data])

  return query
}

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
