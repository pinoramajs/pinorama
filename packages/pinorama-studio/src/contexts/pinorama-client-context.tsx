import { createContext, useContext } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PinoramaClient } from "pinorama-client/browser"
import type { BaseOramaPinorama } from "pinorama-types"
import { useAppConfig } from "./app-config-context"

type PinoramaClientProviderProps = {
  children: React.ReactNode
}

const PinoramaClientContext =
  createContext<PinoramaClient<BaseOramaPinorama> | null>(null)

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

  const pinoramaClient: PinoramaClient<BaseOramaPinorama> | null = appConfig
    ?.config.connectionUrl
    ? new PinoramaClient({ url: appConfig.config.connectionUrl })
    : null

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
