import type { AnySchema } from "@orama/orama"
import type { PinoramaIntrospection } from "pinorama-types"

type PinoramaPreset<T extends AnySchema> = {
  schema: T
  introspection: PinoramaIntrospection<T>
}

export function createPreset<T extends AnySchema>(
  schema: T,
  introspection: PinoramaIntrospection<T>
): PinoramaPreset<T> {
  return { schema, introspection }
}
