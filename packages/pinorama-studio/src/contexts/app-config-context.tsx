import { createContext, use, useEffect, useState } from "react"

type AppConfigContextType = {
  connectionIntent: boolean
  setConnectionIntent: (value: boolean) => void
  adminSecret: string | null
  setAdminSecret: (value: string | null) => void
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider(props: { children: React.ReactNode }) {
  const [connectionIntent, setConnectionIntent] = useState(false)
  const [adminSecret, setAdminSecret] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const serverUrl = params.get("serverUrl")
    if (serverUrl) {
      setConnectionIntent(true)
    }

    const secret = params.get("adminSecret")
    if (secret) {
      setAdminSecret(secret)
      params.delete("adminSecret")
      const qs = params.toString()
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`
      window.history.replaceState(null, "", newUrl)
    }
  }, [])

  return (
    <AppConfigContext
      value={{
        connectionIntent,
        setConnectionIntent,
        adminSecret,
        setAdminSecret
      }}
    >
      {props.children}
    </AppConfigContext>
  )
}

export const useAppConfig = () => {
  const context = use(AppConfigContext)

  if (context === undefined) {
    throw new Error("useAppConfig must be used within a AppConfigProvider")
  }

  return context
}
