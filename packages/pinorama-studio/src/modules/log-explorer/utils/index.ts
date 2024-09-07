import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"

const createBasePayload = <T extends BaseOramaPinorama>({
  preflight = false
}: { preflight: boolean }): SearchParams<T> => ({
  limit: 10,
  sortBy: { property: "_pinorama.createdAt" },
  preflight
})

const withTerm =
  <T extends BaseOramaPinorama>(term: string) =>
  (payload: SearchParams<T>): SearchParams<T> => {
    return { ...payload, term }
  }

const withFilters =
  <T extends BaseOramaPinorama>(
    filters: SearchParams<BaseOramaPinorama>["where"]
  ) =>
  (payload: SearchParams<T>): SearchParams<T> => {
    const where: SearchParams<T>["where"] = payload.where || {}
    return { ...payload, where: { ...where, ...filters } }
  }

const withCursor =
  <T extends BaseOramaPinorama>(cursor: number) =>
  (payload: SearchParams<T>): SearchParams<T> => {
    const where: SearchParams<T>["where"] = payload.where || {}
    return {
      ...payload,
      where: { ...where, "_pinorama.createdAt": { gt: cursor || 0 } }
    }
  }

export const buildPayload = <T extends BaseOramaPinorama>({
  term,
  filters,
  cursor,
  preflight
}: {
  term?: string
  filters?: SearchParams<T>["where"]
  cursor?: number
  preflight?: boolean
}) => {
  let payload = createBasePayload({ preflight: !!preflight })

  if (term) {
    const addTerm = withTerm(term)
    payload = addTerm(payload)
  }

  if (filters) {
    const addFilters = withFilters(filters)
    payload = addFilters(payload)
  }

  if (cursor) {
    const addCursor = withCursor(cursor)
    payload = addCursor(payload)
  }

  return payload
}
