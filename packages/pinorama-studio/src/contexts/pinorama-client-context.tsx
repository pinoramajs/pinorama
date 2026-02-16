import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { PinoramaClient } from "pinorama-client/browser"
import type { BaseOramaPinorama } from "pinorama-types"
import { createContext, use } from "react"
import { toast } from "sonner"
import { serverUrlParam } from "@/lib/search-params"
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
  const [serverUrl] = useQueryState("serverUrl", serverUrlParam)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: appConfig?.connectionIntent
      },
      mutations: {
        onError: (error) => toast.error(error.message)
      }
    }
  })

  const pinoramaClient: PinoramaClient<BaseOramaPinorama> | null = serverUrl
    ? new PinoramaClient({
        url: serverUrl,
        adminSecret: appConfig?.adminSecret ?? undefined
      })
    : null

  return (
    <QueryClientProvider client={queryClient}>
      <PinoramaClientContext value={pinoramaClient}>
        {children}
      </PinoramaClientContext>
    </QueryClientProvider>
  )
}

export const usePinoramaClient = () => {
  const context = use(PinoramaClientContext)

  if (context === undefined) {
    throw new Error(
      "usePinoramaClient must be used within a PinoramaClientProvider"
    )
  }

  return context
}
