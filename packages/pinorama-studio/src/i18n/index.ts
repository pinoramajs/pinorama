import { IntlConfig } from "react-intl"

const importLocale = async (locale: string) => (await import(`./jsons/${locale}.json`)).default

const retrieveI18nContent = async () => {
    let i18nContent: Record<string, string> = {}

    try {
        i18nContent = await importLocale(defaultConfig.locale)
    } catch {
        i18nContent = await importLocale(defaultConfig.defaultLocale!)
    }

    return i18nContent
}

export const defaultConfig: IntlConfig = {
    defaultLocale: 'en',
    locale: navigator.language
}

export const retrieveI18nConfig = async (): Promise<IntlConfig> => {
    const messages = await retrieveI18nContent();

    return {...defaultConfig, messages}
}
