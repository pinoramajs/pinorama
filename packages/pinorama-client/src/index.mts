import { setTimeout } from "node:timers/promises"
import { URL } from "node:url"
import { Client } from "undici"
import { z } from "zod"

import type { Readable } from "node:stream"
import type { IncomingHttpHeaders } from "undici/types/header.js"

const clientOptionsSchema = z.object({
  url: z.string(),
  maxRetries: z.number().min(2),
  backoff: z.number().min(0),
  backoffFactor: z.number().min(2),
  backoffMax: z.number().min(1000),
  adminSecret: z.string().optional()
})

const bulkOptionsSchema = z.object({
  batchSize: z.number(),
  flushInterval: z.number()
})

export type PinoramaClientOptions = z.infer<typeof clientOptionsSchema>
export type PinoramaBulkOptions = z.infer<typeof bulkOptionsSchema>

export const defaultClientOptions: Partial<PinoramaClientOptions> = {
  maxRetries: 5,
  backoff: 1000,
  backoffFactor: 2,
  backoffMax: 30000
}

export const defaultBulkOptions: Partial<PinoramaBulkOptions> = {
  batchSize: 100,
  flushInterval: 5000
}

export class PinoramaClient {
  /** Base path derived from the URL */
  private basePath: string

  /** Maximum number of retry attempts */
  private maxRetries: number

  /** Initial backoff delay in milliseconds */
  private backoff: number

  /** Factor by which the backoff delay increases */
  private backoffFactor: number

  /** Maximum backoff delay in milliseconds */
  private backoffMax: number

  /** HTTP client for making requests */
  private client: Client

  /** Default headers for HTTP requests */
  private defaultHeaders: IncomingHttpHeaders

  constructor(options?: Partial<PinoramaClientOptions>) {
    const opts = clientOptionsSchema.parse({
      ...defaultClientOptions,
      ...options
    })

    const { origin, pathname } = new URL(opts.url)
    this.basePath = pathname.length === 1 ? "" : pathname

    this.client = new Client(origin)
    this.maxRetries = opts.maxRetries
    this.backoff = opts.backoff
    this.backoffFactor = opts.backoffFactor
    this.backoffMax = opts.backoffMax

    this.defaultHeaders = this.getDefaultHeaders(opts)
  }

  private getDefaultHeaders(options: Partial<PinoramaClientOptions>) {
    const headers: IncomingHttpHeaders = {
      "content-type": "application/json"
    }

    if (options.adminSecret) {
      headers["x-pinorama-admin-secret"] = options.adminSecret
    }

    return headers
  }

  private async retryOperation(operation: () => Promise<void>): Promise<void> {
    let retries = 0
    let currentBackoff = this.backoff
    while (retries < this.maxRetries) {
      try {
        await operation()
        return
      } catch (error) {
        console.error("error during operation:", error)
        retries++
        if (retries >= this.maxRetries) throw new Error("max retries reached")
        await setTimeout(Math.min(currentBackoff, this.backoffMax))
        currentBackoff *= this.backoffFactor
      }
    }
  }

  public async insert(docs: any[]): Promise<void> {
    await this.retryOperation(async () => {
      const { statusCode } = await this.client.request({
        path: `${this.basePath}/bulk`,
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(docs)
      })

      if (statusCode !== 201) {
        throw new Error("[TODO ERROR]: PinoramaClient.insert failed")
      }
    })
  }

  public bulkInsert(stream: Readable, options?: Partial<PinoramaBulkOptions>) {
    const opts = bulkOptionsSchema.parse({ ...defaultBulkOptions, ...options })

    const buffer: any[] = []
    let flushing = false

    const flush = async () => {
      if (buffer.length === 0 || flushing) return
      flushing = true

      try {
        stream.pause()
        await this.insert(buffer)
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

    return { flush }
  }

  public async search(payload: unknown): Promise<unknown> {
    try {
      const { statusCode, body } = await this.client.request({
        path: `${this.basePath}/search`,
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(payload)
      })

      const json = (await body.json()) as { error: string }
      if (statusCode !== 200) {
        throw new Error(json.error)
      }

      return json
    } catch (error) {
      console.error("error searching logs:", error)
      throw error
    }
  }
}
