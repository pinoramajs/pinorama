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
  adminSecret?: string
  maxRetries?: number
  backoff?: number
  backoffFactor?: number
  backoffMax?: number
}

export class PinoramaClient {
  /** Base URL for API requests */
  private baseUrl: string

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

  /** Buffer to hold data before bulk insertion */
  private buffer: any[] = []

  /** Timer handle for managing flush intervals */
  private timer: NodeJS.Timeout | null = null

  /** Stream for reading log data */
  private logStream: Readable | undefined

  /**
   * Constructor to create a new Pinorama client instance.
   * @param options Configuration options for the client.
   */
  constructor(options: PinoramaClientOptions) {
    /* url params */
    const url = new URL(options.url)
    this.baseUrl = url.origin
    this.basePath = url.pathname.length === 1 ? "" : url.pathname

    /* backoff strategy */
    this.backoff = options.backoff || 1000
    this.backoffFactor = options.backoffFactor || 2
    this.backoffMax = options.backoffMax || 30000

    /* http client */
    this.client = new Client(this.baseUrl)
    this.maxRetries = options.maxRetries || 5

    /* http headers */
    this.defaultHeaders = {
      "content-type": "application/json",
      ...(options.adminSecret ? { "x-pinorama-admin-secret": options.adminSecret } : {})
    }
  }

  /**
   * Begins bulk insertion of logs from a readable stream.
   * @param logStream A readable stream of log data.
   * @param options Configuration options for bulk insert operations.
   */
  async bulkInsert(logStream: Readable, options: BulkInsertOptions): Promise<void> {
    this.logStream = logStream
    this.logStream.on("data", (data) => this.onData(data, options))
    this.timer = setInterval(() => this.flush(), options.flushInterval)
  }

  /**
   * Handles data from the log stream and manages the buffer for insertion.
   * @param data Data received from the log stream.
   * @param options Bulk insertion configuration options.
   */
  private async onData(data: any, options: BulkInsertOptions) {
    this.buffer.push(data)
    if (this.buffer.length >= options.batchSize) {
      if (this.timer) clearTimeout(this.timer)
      await this.flush()
    }
  }

  /**
   * Flushes the buffer by sending its contents to Pinorama server.
   */
  public async flush(): Promise<void> {
    this.logStream?.pause()

    if (this.buffer.length === 0) {
      return
    }

    try {
      await this.sendLogs(this.buffer)
      this.buffer = []
    } catch (error) {
      console.error("Failed to flush logs:", error)
    }

    this.logStream?.resume()
  }

  /**
   * Sends a search request to Pinorama server.
   * @param payload Payload to be sent in the search request.
   */
  async search(payload: any): Promise<any> {
    try {
      const { statusCode, body } = await this.client.request({
        path: `${this.basePath}/search`,
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(payload)
      })

      const json = await body.json()
      if (statusCode !== 200) {
        throw new Error((json as { error: string }).error)
      }

      return json
    } catch (error) {
      console.error("error searching logs:", error)
      throw error
    }
  }

  /**
   * Sends logs to Pinorama server using a POST request.
   * @param logs Array of logs to be sent.
   */
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
          const json = (await body.json()) as { error: string }
          throw new Error(json.error)
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
