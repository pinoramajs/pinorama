import type { SearchParams } from "@orama/orama"
import type { BaseOramaPinorama } from "pinorama-types"
import { DEFAULT_PAGE_SIZE } from "../constants"

type BuildPayloadOptions = {
  limit?: number
  offset?: number
  cursor?: number
  searchProperties?: string[]
}

const createBasePayload = <T extends BaseOramaPinorama>(
  limit: number
): SearchParams<T> => ({
  limit,
  sortBy: { property: "_pinorama.createdAt" }
})

const withSearchText =
  <T extends BaseOramaPinorama>(
    searchText: string,
    searchProperties?: string[]
  ) =>
  (payload: SearchParams<T>): SearchParams<T> => {
    return {
      ...payload,
      term: searchText,
      ...(searchProperties && { properties: searchProperties })
    } as SearchParams<T>
  }

const withSearchFilters =
  <T extends BaseOramaPinorama>(
    searchFilters: SearchParams<BaseOramaPinorama>["where"]
  ) =>
  (payload: SearchParams<T>): SearchParams<T> => {
    const where = (payload.where || {}) as Record<string, unknown>
    return {
      ...payload,
      where: { ...where, ...searchFilters } as SearchParams<T>["where"]
    }
  }

const withCursor =
  <T extends BaseOramaPinorama>(cursor: number) =>
  (payload: SearchParams<T>): SearchParams<T> => {
    const where = (payload.where || {}) as Record<string, unknown>
    return {
      ...payload,
      where: {
        ...where,
        "_pinorama.createdAt": { gt: cursor || 0 }
      } as SearchParams<T>["where"]
    }
  }

const withOffset =
  <T extends BaseOramaPinorama>(offset: number) =>
  (payload: SearchParams<T>): SearchParams<T> => {
    return { ...payload, offset }
  }

export const buildPayload = <T extends BaseOramaPinorama>(
  searchText?: string,
  searchFilters?: SearchParams<T>["where"],
  options?: BuildPayloadOptions
) => {
  const {
    limit = DEFAULT_PAGE_SIZE,
    offset,
    cursor,
    searchProperties
  } = options ?? {}

  let payload = createBasePayload(limit)

  if (searchText) {
    const addSearchText = withSearchText(searchText, searchProperties)
    payload = addSearchText(payload)
  }

  if (searchFilters) {
    const addSearchFilters = withSearchFilters(
      searchFilters as SearchParams<BaseOramaPinorama>["where"]
    )
    payload = addSearchFilters(payload)
  }

  if (offset !== undefined && offset > 0) {
    const addOffset = withOffset(offset)
    payload = addOffset(payload)
  }

  if (cursor) {
    const addCursor = withCursor(cursor)
    payload = addCursor(payload)
  }

  return payload
}
