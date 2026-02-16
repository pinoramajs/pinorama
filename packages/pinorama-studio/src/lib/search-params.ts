import { parseAsBoolean, parseAsString } from "nuqs"

export const serverUrlParam = parseAsString.withDefault("http://localhost:6200")
export const liveModeParam = parseAsBoolean.withDefault(false)
