import type { AnySchema } from "@orama/orama"
import type { IntrospectionFacet, PinoramaIntrospection } from "pinorama-types"

export const getFacetsConfig = (
  introspection: PinoramaIntrospection<AnySchema>
) => {
  const definition: { name: string; type: IntrospectionFacet }[] = []

  const facets = introspection.facets
  if (!facets) return { definition }

  for (const [name, config] of Object.entries(facets)) {
    definition.push({
      name,
      type: config as IntrospectionFacet
    })
  }

  return { definition }
}
