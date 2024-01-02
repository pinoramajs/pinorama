import { URL } from "node:url"
import { setTimeout } from "node:timers/promises"
import { Readable } from "stream"
import { Client } from "undici"

type BulkInsertOptions = {
  batchSize: number
  flushInterval: number
}

export type PinoramaClientOptions = {
  url: string
  maxRetries: number
  retryInterval: number
}

export class PinoramaClient {
  private baseUrl: string
  private basePath: string
  private maxRetries: number
  private retryInterval: number
  private client: Client

  constructor(options: PinoramaClientOptions) {
    const url = new URL(options.url)
    this.baseUrl = url.origin
    this.basePath = url.pathname.length === 1 ? "" : url.pathname
    this.maxRetries = options.maxRetries
    this.retryInterval = options.retryInterval
    this.client = new Client(this.baseUrl)
    // console.log(options)
  }

  async bulkInsert(
    logStream: Readable,
    options: BulkInsertOptions
  ): Promise<void> {
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
    while (retries < this.maxRetries) {
      try {
        await this.client.request({
          path: this.basePath + "/bulk",
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify(logs)
        })
        return
      } catch (error) {
        console.error("error sending logs:", error)
        retries++
        await setTimeout(this.retryInterval)
      }
    }
  }
}
