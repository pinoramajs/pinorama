import type { Readable } from "node:stream"
import { setTimeout } from "node:timers/promises"
import { URL } from "node:url"
import { Client } from "undici"
import type { IncomingHttpHeaders } from "undici/types/header.js"

type BulkInsertOptions = {
  batchSize: number
  flushInterval: number
}

export type PinoramaClientOptions = {
  url: string
  adminSecret: string
  maxRetries: number
  backoff: number
  backoffFactor: number
  backoffMax: number
}

export class PinoramaClient {
  private baseUrl: string
  private basePath: string
  private maxRetries: number
  private backoff: number
  private backoffFactor: number
  private backoffMax: number
  private client: Client
  private defaultHeaders: IncomingHttpHeaders

  constructor(options: PinoramaClientOptions) {
    const url = new URL(options.url)
    this.baseUrl = url.origin
    this.basePath = url.pathname.length === 1 ? "" : url.pathname
    this.maxRetries = options.maxRetries || 5
    this.backoff = options.backoff || 1000
    this.backoffFactor = options.backoffFactor || 2
    this.backoffMax = options.backoffMax || 30000
    this.client = new Client(this.baseUrl)
    this.defaultHeaders = {
      "content-type": "application/json",
      "x-pinorama-admin-secret": options.adminSecret || "your-secret"
    }
    // console.log(options)
  }

  async bulkInsert(logStream: Readable, options: BulkInsertOptions): Promise<void> {
    // let count = 0
    let buffer: any[] = []
    let timer: NodeJS.Timeout | null = null

    const flush = async () => {
      if (buffer.length === 0) return
      try {
        // count += buffer.length
        // console.log(count)
        await this.sendLogs(buffer)
        buffer = []
        logStream.resume()
      } catch (error) {
        console.error("failed to send logs:", error)
      }
    }

    const onData = (data: any) => {
      buffer.push(data)
      if (buffer.length >= options.batchSize) {
        logStream.pause()
        if (timer) clearTimeout(timer)
        flush()
      }
    }

    const onEnd = () => {
      if (timer) clearTimeout(timer)
      flush()
    }

    logStream.on("data", onData)
    logStream.on("end", onEnd)
    timer = setInterval(flush, options.flushInterval)
  }

  private async sendLogs(logs: any[]): Promise<void> {
    let retries = 0
    let currentBackoff = this.backoff

    while (retries < this.maxRetries) {
      try {
        const { statusCode, body } = await this.client.request({
          path: `${this.basePath}/bulk`,
          method: "POST",
          headers: this.defaultHeaders,
          body: JSON.stringify(logs)
        })

        if (statusCode !== 201) {
          const json = await body.json()
          throw new Error((json as { error: string }).error)
        }

        return
      } catch (error) {
        console.error("error sending logs:", error)
        retries++
        await setTimeout(Math.min(currentBackoff, this.backoffMax))
        currentBackoff *= this.backoffFactor
      }
    }

    throw new Error("max retries reached in sending logs")
  }
}
