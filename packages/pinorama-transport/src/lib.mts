import type { Transform } from "node:stream"
import { setInterval } from "node:timers"
import abstractTransport from "pino-abstract-transport"
import type { PinoramaClientOptions } from "pinorama-client/node"
import { PinoramaClient } from "pinorama-client/node"
import type { BaseOramaPinorama, PinoramaDocument } from "pinorama-types"

type BulkOptions = {
  batchSize: number
  flushInterval: number
  maxBufferSize: number
}

export const defaultBulkOptions: BulkOptions = {
  batchSize: 100,
  flushInterval: 1000,
  maxBufferSize: 10_000
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

  const bulkOpts = filterOptions(options, [
    "batchSize",
    "flushInterval",
    "maxBufferSize"
  ])

  const client = new PinoramaClient(clientOpts)

  let close = async () => {}

  /* build */
  const buildFn = async (stream: Transform) => {
    const buffer: PinoramaDocument<BaseOramaPinorama>[] = []
    let flushing: Promise<void> | undefined

    const opts: BulkOptions = {
      batchSize: bulkOpts?.batchSize ?? defaultBulkOptions.batchSize,
      flushInterval:
        bulkOpts?.flushInterval ?? defaultBulkOptions.flushInterval,
      maxBufferSize: bulkOpts?.maxBufferSize ?? defaultBulkOptions.maxBufferSize
    }

    const send = async () => {
      try {
        stream.pause()
        await client.insert(buffer)
        buffer.length = 0
      } catch (error) {
        console.error("Failed to flush logs:", error)
      } finally {
        stream.resume()
      }
    }

    const flush = () => {
      if (buffer.length === 0) return flushing ?? Promise.resolve()
      flushing ??= send().finally(() => {
        flushing = undefined
      })
      return flushing
    }

    const intervalId = setInterval(() => {
      flush()
    }, opts.flushInterval)

    stream.on("data", async (data) => {
      buffer.push(data)
      if (buffer.length > opts.maxBufferSize) {
        buffer.splice(0, buffer.length - opts.maxBufferSize)
      }
      if (buffer.length >= opts.batchSize) {
        await flush()
      }
    })

    close = async () => {
      clearInterval(intervalId)
      await flush()
    }
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

  return abstractTransport(buildFn, {
    parseLine: parseLineFn,
    // runs on end and on destroy: the stream closes once the buffer is delivered
    close: (err, cb) => close().finally(() => cb(err))
  })
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
