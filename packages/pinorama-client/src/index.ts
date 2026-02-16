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

export class PinoramaError extends Error {
  status: number
  errorDetails?: unknown

  constructor(status: number, message: string, errorDetails?: unknown) {
    super(message)
    this.name = "PinoramaError"
    this.status = status
    this.errorDetails = errorDetails
  }
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

  private async throwResponseError(response: Response, message: string) {
    let body: unknown
    try {
      body = await response.json()
    } catch {}
    throw new PinoramaError(response.status, message, body)
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
        if (retries >= this.maxRetries) {
          throw error instanceof PinoramaError
            ? error
            : new PinoramaError(0, "max retries reached")
        }
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
        await this.throwResponseError(response, "insert failed")
      }
    })
  }

  public async search(payload: SearchParams<T>) {
    const response = await fetch(`${this.url}/search`, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      await this.throwResponseError(response, "search failed")
    }

    return (await response.json()) as Results<TypedDocument<T>>
  }

  public async styles(): Promise<string> {
    const response = await fetch(`${this.url}/styles.css`, {
      method: "GET",
      headers: { ...this.defaultHeaders, contentType: "text/css" }
    })

    if (response.status !== 200) {
      await this.throwResponseError(response, "styles failed")
    }

    return await response.text()
  }

  public async introspection() {
    const response = await fetch(`${this.url}/introspection`, {
      method: "GET",
      headers: this.defaultHeaders
    })

    if (!response.ok) {
      await this.throwResponseError(response, "introspection failed")
    }

    return (await response.json()) as PinoramaIntrospection<T["schema"]>
  }

  public async clear(): Promise<void> {
    const response = await fetch(`${this.url}/clear`, {
      method: "POST"
    })

    if (!response.ok) {
      await this.throwResponseError(response, "clear failed")
    }
  }

  public async stats(): Promise<PinoramaStats> {
    const response = await fetch(`${this.url}/stats`, {
      method: "GET",
      headers: this.defaultHeaders
    })

    if (!response.ok) {
      await this.throwResponseError(response, "stats failed")
    }

    return (await response.json()) as PinoramaStats
  }
}
