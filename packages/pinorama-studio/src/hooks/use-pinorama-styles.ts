import { usePinoramaClient } from "@/contexts"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

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
