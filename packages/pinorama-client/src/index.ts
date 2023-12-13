import { setTimeout } from "node:timers/promises"
import { Readable } from "stream"
import { Pool } from "undici"

type PinoramaClientOptions = {
  baseUrl: string
  maxRetries: number
  retryInterval: number
}

type BulkInsertOptions = {
  batchSize: number
  flushInterval: number
}

class PinoramaClient {
  private pool: Pool
  private maxRetries: number
  private retryInterval: number

  constructor(options: PinoramaClientOptions) {
    this.pool = new Pool(options.baseUrl)
    this.maxRetries = options.maxRetries
    this.retryInterval = options.retryInterval
  }

  async bulkInsert(
    logStream: Readable,
    options: BulkInsertOptions
  ): Promise<void> {
    let buffer: any[] = []
    let timer: NodeJS.Timeout | null = null

    const flush = async () => {
      if (buffer.length === 0) return
      try {
        await this.sendLogs(buffer)
        buffer = []
      } catch (error) {
        console.error("failed to send logs:", error)
      }
    }

    const onData = (data: any) => {
      buffer.push(data)
      if (buffer.length >= options.batchSize) {
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
        await this.pool.request({
          path: "/bulk",
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

export { PinoramaClient }
