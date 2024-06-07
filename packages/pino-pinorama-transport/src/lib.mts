import abstractTransport from "pino-abstract-transport"
import { PinoramaClient } from "pinorama-client"

import type { Transform } from "node:stream"
import type {
  PinoramaBulkOptions,
  PinoramaClientOptions
} from "pinorama-client"

export type PinoramaTransportOptions = PinoramaClientOptions &
  PinoramaBulkOptions

/**
 * Creates a pino transport that sends logs to a Pinorama server.
 *
 * @param {Partial<PinoramaTransportOptions>} options - Optional settings overrides.
 * @returns {Transform} Configured transport instance.
 */
export default function pinoramaTransport(
  options: Partial<PinoramaTransportOptions>
): Transform {
  const clientOpts = filterOptions(options, [
    "url",
    "maxRetries",
    "backoff",
    "backoffFactor",
    "backoffMax",
    "adminSecret"
  ])

  const bulkOpts = filterOptions(options, ["batchSize", "flushInterval"])

  const client = new PinoramaClient(clientOpts)

  let flushFn: () => Promise<void>

  /* build */
  const buildFn = async (stream: Transform) => {
    const { flush } = client.bulkInsert(stream, bulkOpts)
    flushFn = flush
  }

  /* close */
  const closeFn = async () => {
    return flushFn && (await flushFn())
  }

  /* parseLine */
  const parseLineFn = (line: string) => {
    const obj = JSON.parse(line)

    if (Object.prototype.toString.call(obj) !== "[object Object]") {
      throw new Error("not a plain object.")
    }

    if (Object.keys(obj).length === 0) {
      throw new Error("object is empty.")
    }

    return obj
  }

  return abstractTransport(buildFn, { close: closeFn, parseLine: parseLineFn })
}

/**
 * Filters and returns options specified by keys.
 */
export function filterOptions<T extends object>(
  options: Partial<T>,
  keys: (keyof T)[]
): Partial<T> | undefined {
  let result: Partial<T> | undefined
  for (const key of keys) {
    if (key in options) {
      result = result || {}
      result[key] = options[key]
    }
  }
  return result
}
