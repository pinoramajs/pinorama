import { type Locale, type Messages, getMessages } from "@/i18n"
import { useContext, useEffect, useState } from "react"
import { createContext } from "react"
import type React from "react"
import { IntlProvider } from "react-intl"

type I18nProviderProps = {
  children: React.ReactNode
}

type LocaleContextProps = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined)

const defaultLocale: Locale = "en"

export function I18nProvider(props: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(
    (localStorage.getItem("locale") as Locale) ?? defaultLocale
  )
  const [messages, setMessages] = useState<Messages | null>(null)

  useEffect(() => {
    const loadMessages = async () => {
      const messages = await getMessages(locale)
      setMessages(messages)
    }

    loadMessages()
  }, [locale])

  const handleChangeLocale = async (newLocale: Locale) => {
    setMessages(null)
    const messages = await getMessages(newLocale)
    setLocale(newLocale)
    setMessages(messages)
    localStorage.setItem("locale", newLocale)
  }

  if (messages === null) {
    return null
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleChangeLocale }}>
      <IntlProvider locale={locale} messages={messages}>
        {props.children}
      </IntlProvider>
    </LocaleContext.Provider>
  )
}

export const useLocale = (): LocaleContextProps => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within an I18nProvider")
  }
  return context
}
