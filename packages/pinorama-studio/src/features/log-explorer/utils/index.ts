import type { SearchParams } from "@orama/orama"
import type { OramaPinorama, PinoramaDocument } from "pinorama-server"

export type PinoramaDocumentMetadata = {
  createdAt: number
}

export const getDocumentMetadata = (document: PinoramaDocument) =>
  document._pinorama as PinoramaDocumentMetadata

const createBasePayload = (): SearchParams<OramaPinorama> => ({
  limit: 10_000,
  sortBy: { property: "_pinorama.createdAt" }
})

const withSearchText =
  (searchText: string) =>
  (payload: SearchParams<OramaPinorama>): SearchParams<OramaPinorama> => {
    return { ...payload, term: searchText }
  }

const withSearchFilters =
  (searchFilters: SearchParams<OramaPinorama>["where"]) =>
  (payload: SearchParams<OramaPinorama>): SearchParams<OramaPinorama> => {
    const where = payload.where || {}
    return { ...payload, where: { ...where, ...searchFilters } }
  }

const withCursor =
  (cursor: number) => (payload: SearchParams<OramaPinorama>) => ({
    ...payload,
    where: { ...payload.where, "_pinorama.createdAt": { gt: cursor || 0 } }
  })

export const buildPayload = (
  searchText?: string,
  searchFilters?: SearchParams<OramaPinorama>["where"],
  cursor?: number
) => {
  let payload = createBasePayload()

  if (searchText) {
    const addSearchText = withSearchText(searchText)
    payload = addSearchText(payload)
  }

  if (searchFilters) {
    const addSearchFilters = withSearchFilters(searchFilters)
    payload = addSearchFilters(payload)
  }

  if (cursor) {
    const addCursor = withCursor(cursor)
    payload = addCursor(payload)
  }

  return payload
}
