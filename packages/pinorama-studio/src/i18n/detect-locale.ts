export const locales = ["en", "it"] as const

export type Locale = (typeof locales)[number]

function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale)
}

/**
 * A stored choice wins, then the first browser language we support,
 * then english.
 */
export function detectLocale(
  stored: string | null,
  languages: readonly string[]
): Locale {
  if (isLocale(stored)) return stored

  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0]
    if (isLocale(base)) return base
  }

  return "en"
}
