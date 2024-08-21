import type { AnyOrama } from "@orama/orama"

export const withPinoramaMetadataSchema = (
  schema: AnyOrama["schema"]
): AnyOrama["schema"] => {
  return {
    ...schema,
    _pinorama: {
      createdAt: "number"
    }
  }
}

export const withPinoramaMetadataValue = (
  value: Record<string, unknown>
): Record<string, unknown> => {
  return {
    ...value,
    _pinorama: {
      createdAt: Date.now()
    }
  }
}
