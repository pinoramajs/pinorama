import type { AnyOrama } from "@orama/orama"

export const withPinoramaSchema = (
  schema: AnyOrama["schema"]
): AnyOrama["schema"] => {
  return {
    ...schema,
    _pinorama: {
      createdAt: "number"
    }
  }
}

export const withPinoramaValue = (
  value: Record<string, unknown>
): Record<string, unknown> => {
  return {
    ...value,
    _pinorama: {
      createdAt: Date.now()
    }
  }
}
