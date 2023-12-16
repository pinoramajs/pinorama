import abstractTransport from "pino-abstract-transport"
import { PinoramaClient } from "pinorama-client"
import type { PinoramaClientOptions } from "pinorama-client"
import type { Transform } from "node:stream"

type PinoramaTransportOptions = {
  url: string
  maxRetries: number
  retryInterval: number
}

export default async function pinoramaTransport(
  opts: PinoramaTransportOptions
) {
  const clientOpts: PinoramaClientOptions = {
    baseUrl: opts.url,
    maxRetries: opts.maxRetries || 5,
    retryInterval: opts.retryInterval || 1000
  }

  const client = new PinoramaClient(clientOpts)

  const buildFn = async (source: Transform) => {
    client.bulkInsert(source, {
      batchSize: 1000,
      flushInterval: 5000
    })
  }

  const closeFn = async () => {
    // TODO: flush client buffer
  }

  return abstractTransport(buildFn, { close: closeFn })
}
