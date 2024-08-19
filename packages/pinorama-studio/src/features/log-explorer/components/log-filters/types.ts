export type OramaPropType = "string" | "enum"

export type FacetValue = {
  value: string | number
  count: number
}

export type StringFilter = string[]
export type EnumFilter = { in: (string | number)[] }
export type FacetFilter = StringFilter | EnumFilter

export type SearchFilters = Record<string, FacetFilter>
