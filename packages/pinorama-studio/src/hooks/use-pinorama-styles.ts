import { useQuery } from "@tanstack/react-query"
import { usePinoramaClient } from "@/contexts"

const PINORAMA_STYLES_ID = "pinorama-styles"

const insertStyle = (data?: string) => {
  if (!data) return

  let styleElement = document.getElementById(
    PINORAMA_STYLES_ID
  ) as HTMLStyleElement

  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = PINORAMA_STYLES_ID
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = data
}

export const usePinoramaStyles = () => {
  const client = usePinoramaClient()

  return useQuery({
    queryKey: ["styles"],
    queryFn: async () => {
      const response = await client?.styles()
      insertStyle(response)
      return response
    },
    staleTime: Number.POSITIVE_INFINITY
  })
}
