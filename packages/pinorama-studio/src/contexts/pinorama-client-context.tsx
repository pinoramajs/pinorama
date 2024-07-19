import { createContext, useContext } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PinoramaClient } from "pinorama-client/browser"
import { useAppConfig } from "./app-config-context"

type PinoramaClientProviderProps = {
  children: React.ReactNode
}

const PinoramaClientContext = createContext<PinoramaClient | null>(null)

export function PinoramaClientProvider({
  children
}: PinoramaClientProviderProps) {
  const appConfig = useAppConfig()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: appConfig?.config.connectionIntent
      }
    }
  })

  let pinoramaClient: PinoramaClient | null = null
  if (appConfig?.config.connectionUrl) {
    pinoramaClient = new PinoramaClient({
      url: appConfig?.config.connectionUrl
    })
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PinoramaClientContext.Provider value={pinoramaClient}>
        {children}
      </PinoramaClientContext.Provider>
    </QueryClientProvider>
  )
}

export const usePinoramaClient = () => {
  const context = useContext(PinoramaClientContext)

  if (context === undefined) {
    throw new Error(
      "usePinoramaClient must be used within a PinoramaClientProvider"
    )
  }

  return context
}
