import { usePinoramaIntrospection } from "@/hooks"
import { Facet } from "./components/facet"

const ALLOWED_TYPES = ["string", "enum"]

export function PinoramaFacets() {
  const { data: introspection }: any = usePinoramaIntrospection()
  if (!introspection?.dbSchema) return null

  return Object.keys(introspection.dbSchema)
    .filter((propertyName) => {
      const type = introspection.dbSchema[propertyName]
      return ALLOWED_TYPES.includes(type)
    })
    .map((propertyName) => {
      return <Facet key={propertyName} propertyName={propertyName} />
    })
}
