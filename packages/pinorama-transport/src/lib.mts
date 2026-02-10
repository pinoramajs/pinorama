import type { Transform } from "node:stream"
import { setInterval } from "node:timers"
import abstractTransport from "pino-abstract-transport"
import type { PinoramaClientOptions } from "pinorama-client/node"
import { PinoramaClient } from "pinorama-client/node"
import type { BaseOramaPinorama, PinoramaDocument } from "pinorama-types"

type BulkOptions = {
  batchSize: number
  flushInterval: number
}

export const defaultBulkOptions: BulkOptions = {
  batchSize: 100,
  flushInterval: 5000
}

export type PinoramaTransportOptions = PinoramaClientOptions & BulkOptions

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

  /* build */
  const buildFn = async (stream: Transform) => {
    const buffer: PinoramaDocument<BaseOramaPinorama>[] = []
    let flushing = false

    const opts: BulkOptions = {
      batchSize: bulkOpts?.batchSize ?? defaultBulkOptions.batchSize,
      flushInterval: bulkOpts?.flushInterval ?? defaultBulkOptions.flushInterval
    }

    const flush = async () => {
      if (buffer.length === 0 || flushing) return
      flushing = true

      try {
        stream.pause()
        await client.insert(buffer)
        buffer.length = 0
      } catch (error) {
        console.error("Failed to flush logs:", error)
      } finally {
        stream.resume()
        flushing = false
      }
    }

    const intervalId = setInterval(() => {
      flush()
    }, opts.flushInterval)

    stream.on("data", async (data) => {
      buffer.push(data)
      if (buffer.length >= opts.batchSize) {
        await flush()
      }
    })

    stream.on("end", async () => {
      clearInterval(intervalId)
      await flush()
    })
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

  return abstractTransport(buildFn, { parseLine: parseLineFn })
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
