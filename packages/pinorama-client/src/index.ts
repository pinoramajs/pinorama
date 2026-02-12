import type {
  AnyOrama,
  Results,
  SearchParams,
  TypedDocument
} from "@orama/orama"
import type { PinoramaIntrospection } from "pinorama-types"
import { z } from "zod"
import { setTimeout } from "./platform/node.js"

export type PinoramaStats = {
  totalDocs: number
  memoryUsage: number
}

const clientOptionsSchema = z.object({
  url: z.string(),
  maxRetries: z.number().min(2),
  backoff: z.number().min(0),
  backoffFactor: z.number().min(2),
  backoffMax: z.number().min(1000),
  adminSecret: z.string().optional()
})

export type PinoramaClientOptions = z.infer<typeof clientOptionsSchema>

export const defaultClientOptions: Partial<PinoramaClientOptions> = {
  maxRetries: 5,
  backoff: 1000,
  backoffFactor: 2,
  backoffMax: 30_000
}

export class PinoramaClient<T extends AnyOrama> {
  /** Pinorama Server URL */
  private url: string

  /** Maximum number of retry attempts */
  private maxRetries: number

  /** Initial backoff delay in milliseconds */
  private backoff: number

  /** Factor by which the backoff delay increases */
  private backoffFactor: number

  /** Maximum backoff delay in milliseconds */
  private backoffMax: number

  /** Default headers for HTTP requests */
  private defaultHeaders: Record<string, string>

  constructor(options?: Partial<PinoramaClientOptions>) {
    const opts = clientOptionsSchema.parse({
      ...defaultClientOptions,
      ...options
    })

    this.url = opts.url
    this.maxRetries = opts.maxRetries
    this.backoff = opts.backoff
    this.backoffFactor = opts.backoffFactor
    this.backoffMax = opts.backoffMax

    this.defaultHeaders = this.getDefaultHeaders(opts)
  }

  private getDefaultHeaders(options: Partial<PinoramaClientOptions>) {
    const headers: Record<string, string> = {
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

  public async insert(docs: TypedDocument<T>[]): Promise<void> {
    await this.retryOperation(async () => {
      const response = await fetch(`${this.url}/bulk`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(docs)
      })

      if (response.status !== 201) {
        throw new Error("[TODO ERROR]: PinoramaClient.insert failed")
      }
    })
  }

  public async search(payload: SearchParams<T>) {
    try {
      const response = await fetch(`${this.url}/search`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error("[TODO ERROR]: PinoramaClient.search failed")
      }

      const json: Results<TypedDocument<T>> = await response.json()

      return json
    } catch (error) {
      console.error("error searching logs:", error)
      throw error
    }
  }

  public async styles(): Promise<string> {
    try {
      const response = await fetch(`${this.url}/styles.css`, {
        method: "GET",
        headers: { ...this.defaultHeaders, contentType: "text/css" }
      })

      if (response.status !== 200) {
        throw new Error("[TODO ERROR]: PinoramaClient.styles failed")
      }

      const css = await response.text()
      return css
    } catch (error) {
      console.error("error fetching styles:", error)
      throw error
    }
  }

  public async introspection() {
    try {
      const response = await fetch(`${this.url}/introspection`, {
        method: "GET",
        headers: this.defaultHeaders
      })

      if (!response.ok) {
        throw new Error("[TODO ERROR]: PinoramaClient.introspection failed")
      }

      const json: PinoramaIntrospection<T["schema"]> = await response.json()

      return json
    } catch (error) {
      console.error("error fetching introspection:", error)
      throw error
    }
  }

  public async clear(): Promise<void> {
    const response = await fetch(`${this.url}/clear`, {
      method: "POST"
    })

    if (!response.ok) {
      throw new Error("[TODO ERROR]: PinoramaClient.clear failed")
    }
  }

  public async stats(): Promise<PinoramaStats> {
    try {
      const response = await fetch(`${this.url}/stats`, {
        method: "GET",
        headers: this.defaultHeaders
      })

      if (!response.ok) {
        throw new Error("[TODO ERROR]: PinoramaClient.stats failed")
      }

      const json: PinoramaStats = await response.json()

      return json
    } catch (error) {
      console.error("error fetching stats:", error)
      throw error
    }
  }
}
