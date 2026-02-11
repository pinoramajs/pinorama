import type { AnyOrama, AnySchema, Orama, TypedDocument } from "@orama/orama"

type SafeFlatten<T> = T extends object
  ? { [K in keyof T]: SafeFlatten<T[K]> }
  : T

type FlattenedKeys<T> = T extends object
  ? {
      [K in keyof T]:
        | `${K & string}`
        | `${K & string}.${FlattenedKeys<T[K]> & string}`
    }[keyof T]
  : never

export type PinoramaIntrospection<T extends AnySchema> = {
  facets?: Partial<{
    [K in FlattenedKeys<SafeFlatten<T>>]: IntrospectionFacet
  }>
  columns: Partial<{
    [K in FlattenedKeys<SafeFlatten<T>>]: IntrospectionColumn
  }>
  labels?: Partial<{
    [K in FlattenedKeys<SafeFlatten<T>>]: IntrospectionLabel
  }>
  formatters?: Partial<{
    [K in FlattenedKeys<SafeFlatten<T>>]: IntrospectionFormatter
  }>
  styles?: Partial<{
    [K in FlattenedKeys<SafeFlatten<T>>]: IntrospectionStyle
  }>
}

export type IntrospectionFacet = "enum" | "string" | "date"

export type IntrospectionColumn = {
  visible: boolean
  size?: number
}

export type IntrospectionLabel =
  | string
  | [string, Record<number | string, string>]

export type IntrospectionFormatter = string | [string, Record<string, any>]

export type IntrospectionStyle =
  | Record<string, string>
  | [Record<string, string>, Record<number | string, Record<string, string>>]

export type PinoramaDocumentMetadata = {
  _pinorama: {
    createdAt: string
  }
}

const baseSchema = {
  _pinorama: {
    createdAt: "number"
  }
} as const

export type BaseOramaPinorama = Orama<typeof baseSchema>
export type PinoramaDocument<T extends AnyOrama> = TypedDocument<T>
