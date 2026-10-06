import type React from "react"
import { createContext, use, useEffect, useState } from "react"
import { IntlProvider } from "react-intl"
import { getMessages, type Locale, type Messages } from "@/i18n"
import { detectLocale } from "@/i18n/detect-locale"

type I18nProviderProps = {
  children: React.ReactNode
}

type LocaleContextProps = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined)

export function I18nProvider(props: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(() =>
    detectLocale(localStorage.getItem("locale"), navigator.languages)
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
    <LocaleContext value={{ locale, setLocale: handleChangeLocale }}>
      <IntlProvider locale={locale} messages={messages}>
        {props.children}
      </IntlProvider>
    </LocaleContext>
  )
}

export const useLocale = (): LocaleContextProps => {
  const context = use(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within an I18nProvider")
  }
  return context
}
