export type FacetValue = {
  value: string | number
  count: number
}

export type StringFilter = string[]
export type EnumFilter = { in: (string | number)[] }
export type DateFilter =
  | { gte: number }
  | { lte: number }
  | { between: [number, number] }
export type FacetFilter = StringFilter | EnumFilter | DateFilter

export type SearchFilters = Record<string, FacetFilter>
