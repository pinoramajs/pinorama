import type { IntrospectionFacet } from "pinorama-types"
import type { DateFilter, EnumFilter, StringFilter } from "../types"

export const facetFilterOperationsFactory = (type: IntrospectionFacet) => {
  switch (type) {
    case "enum":
      return createEnumOperations()
    case "string":
      return createStringOperations()
    case "date":
      return createDateOperations()
    default:
      throw new Error(`unsupported type "${type}" for facet operations`)
  }
}

type FacetOperations<C, V> = {
  create: () => C
  exists: (value: V, criteria: C) => boolean
  length: (criteria: C) => number
  values: (criteria?: C) => unknown[]
  add: (criteria: C, value: V) => C
  remove: (criteria: C, value: V) => C
}

const createEnumOperations = (): FacetOperations<
  EnumFilter,
  string | number
> => ({
  create: () => ({ in: [] }),
  exists: (v, c) => c.in.includes(v),
  length: (c) => c.in.length,
  values: (c) => c?.in || [],
  add: (c, v) => ({ in: [...c.in, v] }),
  remove: (c, v) => ({ in: c.in.filter((_v) => _v !== v) })
})

const createStringOperations = (): FacetOperations<StringFilter, string> => ({
  create: () => [],
  exists: (v, c) => c.includes(v),
  length: (c) => c.length,
  values: (c) => c || [],
  add: (c, v) => [...c, v],
  remove: (c, v) => c.filter((_v) => _v !== v)
})

const createDateOperations = (): FacetOperations<DateFilter, number> => ({
  create: () => ({}) as DateFilter,
  exists: (_v, _c) => false,
  length: (c) => {
    if (!c || Object.keys(c).length === 0) return 0
    if ("between" in c) return 2
    return 1
  },
  values: () => [],
  add: (c, v) => ({ ...c, gte: v }),
  remove: () => ({}) as DateFilter
})
