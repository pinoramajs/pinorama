import abstractTransport from "pino-abstract-transport"
import { PinoramaClient } from "pinorama-client"
import type { Transform } from "node:stream"

export type PinoramaTransportOptions = {
  url: string
  adminSecret: string
  batchSize: number
  flushInterval: number
  maxRetries: number
  backoff: number
  backoffFactor: number
  backoffMax: number
}

export const defaultOptions: PinoramaTransportOptions = {
  url: "http://localhost:6200",
  adminSecret: "your-secret",
  batchSize: 100,
  flushInterval: 5000,
  maxRetries: 5,
  backoff: 1000,
  backoffFactor: 2,
  backoffMax: 30000
}

export default function pinoramaTransport(options: PinoramaTransportOptions) {
  const opts = { ...defaultOptions, ...options }

  const client = new PinoramaClient(opts)

  const buildFn = async (source: Transform) => {
    client.bulkInsert(source, {
      batchSize: opts.batchSize,
      flushInterval: opts.flushInterval
    })
  }

  const closeFn = async () => {
    // TODO: flush client buffer
  }

  return abstractTransport(buildFn, { close: closeFn })
}
