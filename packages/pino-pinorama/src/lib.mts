import type { Transform } from "node:stream"
import abstractTransport from "pino-abstract-transport"
import { PinoramaClient } from "pinorama-client"
import { z } from "zod"

const optionsSchema = z.object({
  url: z.string(),
  adminSecret: z.string().optional(),
  batchSize: z.number().min(2),
  flushInterval: z.number().min(0),
  maxRetries: z.number().min(2),
  backoff: z.number().min(0),
  backoffFactor: z.number().min(2),
  backoffMax: z.number().min(1000)
})

export type PinoramaTransportOptions = z.infer<typeof optionsSchema>

export const defaultOptions: Partial<PinoramaTransportOptions> = {
  /** Number of logs per bulk insert. */
  batchSize: 100,

  /** Time in milliseconds to wait before flushing logs. */
  flushInterval: 5000,

  /** Maximum number of retry attempts for requests. */
  maxRetries: 5,

  /** Initial backoff time in milliseconds for retries. */
  backoff: 1000,

  /** Factor by which the backoff time increases on each retry. */
  backoffFactor: 2,

  /** Maximum backoff time in milliseconds. */
  backoffMax: 30000
}

/**
 * Creates a pino transport that sends logs to Pinorama server instance.
 *
 * @param {Partial<PinoramaTransportOptions>} options - Optional overrides for default settings.
 * @returns {Transform} Configured transport instance.
 */
export default function pinoramaTransport(options?: Partial<PinoramaTransportOptions>): Transform {
  const opts = optionsSchema.parse({ ...defaultOptions, ...options })

  const client = new PinoramaClient({
    url: opts.url,
    adminSecret: opts.adminSecret,
    maxRetries: opts.maxRetries,
    backoff: opts.backoff,
    backoffFactor: opts.backoffFactor,
    backoffMax: opts.backoffMax
  })

  const buildFn = async (source: Transform) => {
    client.bulkInsert(source, {
      batchSize: opts.batchSize,
      flushInterval: opts.flushInterval
    })
  }

  const closeFn = async () => {
    client.flush()
  }

  return abstractTransport(buildFn, { close: closeFn })
}
