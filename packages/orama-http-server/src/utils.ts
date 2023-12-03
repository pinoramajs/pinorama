import type { AnySchema, SearchableType } from "@orama/orama"

type JSONSchema = {
  type: string
  items?: JSONSchema
  properties?: Record<string, JSONSchema>
  required?: string[]
  minItems?: number
  maxItems?: number
}

const oramaTypesMap: Record<SearchableType, JSONSchema> = {
  string: { type: "string" },
  number: { type: "number" },
  boolean: { type: "boolean" },
  enum: { type: "string" },
  geopoint: {
    type: "object",
    properties: {
      lat: { type: "number" },
      lon: { type: "number" }
    },
    required: ["lat", "lon"]
  },
  "string[]": { type: "array", items: { type: "string" } },
  "number[]": { type: "array", items: { type: "number" } },
  "boolean[]": { type: "array", items: { type: "boolean" } },
  "enum[]": { type: "array", items: { type: "string" } }
}

function isOramaPropType(type: unknown): type is SearchableType {
  return typeof type === "string"
}

function mapOramaPropTypeToJSONSchema(
  oramaPropType: SearchableType
): JSONSchema | undefined {
  if (isOramaPropType(oramaPropType)) {
    if (oramaPropType.startsWith("vector[")) {
      const size = parseInt(oramaPropType.match(/\[(\d+)\]/)?.[1] ?? "0", 10)
      return {
        type: "array",
        items: { type: "number" },
        minItems: size,
        maxItems: size
      }
    } else {
      return oramaTypesMap[oramaPropType]
    }
  } else {
    return convertOramaSchemaToJSONSchema(oramaPropType)
  }
}

export function convertOramaSchemaToJSONSchema(
  oramaSchema: AnySchema
): JSONSchema {
  const jsonSchema: JSONSchema = { type: "object", properties: {} }

  Object.keys(oramaSchema).forEach((key) => {
    const propType = oramaSchema[key]
    const schema = mapOramaPropTypeToJSONSchema(propType as SearchableType)
    if (!schema) {
      throw new Error(`unsupported type for key ${key}: ${propType}`)
    }
    jsonSchema.properties![key] = schema
  })

  return jsonSchema
}
