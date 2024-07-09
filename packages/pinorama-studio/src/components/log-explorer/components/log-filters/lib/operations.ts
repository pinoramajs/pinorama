import type { EnumFilter, OramaPropType, StringFilter } from "../types"

export const facetFilterOperationsFactory = (type: OramaPropType) => {
  switch (type) {
    case "enum":
      return createEnumOperations()
    case "string":
      return createStringOperations()
    default:
      throw new Error(`unsupported type: ${type}`)
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
