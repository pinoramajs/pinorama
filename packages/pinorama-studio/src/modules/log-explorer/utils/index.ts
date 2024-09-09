import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"

const createBasePayload = <T extends BaseOramaPinorama>({
  preflight = false,
  pageSize = 100
}: { preflight?: boolean; pageSize?: number }): SearchParams<T> => {
  return preflight
    ? { preflight }
    : { limit: pageSize, sortBy: { property: "_pinorama.createdAt" } }
}

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
  pageSize,
  cursor,
  preflight
}: {
  term?: string
  filters?: SearchParams<T>["where"]
  pageSize?: number
  cursor?: number
  preflight?: boolean
}) => {
  let payload = createBasePayload({ pageSize, preflight })

  if (term?.length) {
    const addTerm = withTerm(term)
    payload = addTerm(payload)
  }

  if (Object.keys(filters || {}).length) {
    const addFilters = withFilters(filters)
    payload = addFilters(payload)
  }

  if (cursor) {
    const addCursor = withCursor(cursor)
    payload = addCursor(payload)
  }

  return payload
}
