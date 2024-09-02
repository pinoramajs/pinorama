import modules from "@/modules"

const appMessages: ImportMessages = {
  en: () => import("./messages/en.json"),
  it: () => import("./messages/it.json")
}

export type Locale = "en" | "it"

export type Messages = Record<string, string>

export type ImportMessages = {
  [key in Locale]: () => Promise<{
    default: Messages
  }>
}

export const getMessages = async (locale: Locale) => {
  let messages: Messages = {}

  // App Messages
  try {
    const module = await appMessages[locale]()
    messages = module.default
  } catch (error) {
    console.warn(`i18n: could not load app messages for "${locale}"`)
  }

  // Module Messages
  for (const mod of modules) {
    const translationImport = mod.messages?.[locale]
    if (translationImport) {
      try {
        const module = await translationImport()
        messages = { ...messages, ...module.default }
      } catch (error) {
        console.warn(
          `i18n: could not load "${mod.id}" messages for "${locale}"`
        )
      }
    }
  }

  return messages
}
