import abstractTransport from "pino-abstract-transport"
import { PinoramaClient } from "pinorama-client"

import type { Transform } from "node:stream"
import type { PinoramaBulkOptions, PinoramaClientOptions } from "pinorama-client"

export type PinoramaTransportOptions = PinoramaClientOptions & PinoramaBulkOptions

/**
 * Creates a pino transport that sends logs to Pinorama server instance.
 *
 * @param {Partial<PinoramaTransportOptions>} options - Optional overrides for default settings.
 * @returns {Transform} Configured transport instance.
 */
export default function pinoramaTransport(options: Partial<PinoramaTransportOptions>): Transform {
  const clientOpts: Partial<PinoramaClientOptions> | undefined = initOpts(options, [
    "url",
    "maxRetries",
    "backoff",
    "backoffFactor",
    "backoffMax",
    "adminSecret"
  ])

  const bulkOpts: Partial<PinoramaBulkOptions> | undefined = initOpts(options, [
    "batchSize",
    "flushInterval"
  ])

  const client = new PinoramaClient(clientOpts)

  let flushFn: () => Promise<void>
  const buildFn = async (stream: Transform) => {
    const { flush } = client.bulkInsert(stream, bulkOpts)
    flushFn = flush
  }

  const closeFn = async () => {
    if (flushFn) {
      await flushFn()
    }
  }

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

function initOpts<T extends object>(
  options: Partial<T>,
  keys: (keyof T)[]
): Partial<T> | undefined {
  let result: Partial<T> | undefined = undefined
  for (const key of keys) {
    if (key in options) {
      result = result || {}
      result[key] = options[key]
    }
  }
  return result
}
