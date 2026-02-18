/**
 * Shared introspection cache and facet validation helpers.
 *
 * The schema is static for the lifetime of a pinorama-server instance,
 * so we cache the first successful introspection response and reuse it
 * for all subsequent calls (get_schema, get_field_values, aggregate_by_field,
 * and the schema resource).
 */

import type { PinoramaClient } from "pinorama-client/node"

export type GetIntrospection = () => Promise<Record<string, any>>

/**
 * Creates a lazy cache around `client.introspection()`.
 * First call fetches from the server; subsequent calls return the cached value.
 */
export function createIntrospectionCache(
  client: PinoramaClient<any>
): GetIntrospection {
  let cached: Record<string, any> | null = null

  return async () => {
    if (!cached) {
      cached = (await client.introspection()) as Record<string, any>
    }
    return cached
  }
}

/**
 * Validates that `field` is a facetable field in the introspection config.
 * Returns an MCP error content response if invalid, or `null` if valid.
 */
export function validateFacetField(
  introspection: Record<string, any>,
  field: string
): { content: Array<{ type: "text"; text: string }> } | null {
  const facetFields = Object.keys(introspection.facets ?? {})
  if (!facetFields.includes(field)) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Field "${field}" is not a filterable/facetable field.\nAvailable fields: ${facetFields.join(", ")}`
        }
      ]
    }
  }
  return null
}
