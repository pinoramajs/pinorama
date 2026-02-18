import { search } from "@orama/orama"
import type { FastifyInstance } from "fastify"
import { serializeError } from "serialize-error"

function flattenSchema(
  schema: Record<string, unknown>,
  prefix = ""
): Set<string> {
  const fields = new Set<string>()
  for (const [key, value] of Object.entries(schema)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "object" && value !== null) {
      for (const f of flattenSchema(value as Record<string, unknown>, path)) {
        fields.add(f)
      }
    } else {
      fields.add(path)
    }
  }
  return fields
}

export async function aggregateRoute(fastify: FastifyInstance) {
  fastify.route({
    url: "/aggregate/field",
    method: "post",
    schema: {
      body: {
        type: "object",
        required: ["field"],
        properties: {
          field: { type: "string" },
          metric: {
            type: "object",
            properties: {
              field: { type: "string" },
              fn: { type: "string", enum: ["count", "avg", "min", "max"] }
            }
          },
          where: { type: "object" },
          limit: { type: "number", default: 10 }
        }
      }
    },
    handler: async (req, res) => {
      try {
        const {
          field,
          metric,
          where,
          limit = 10
        } = req.body as {
          field: string
          metric?: { field: string; fn: "count" | "avg" | "min" | "max" }
          where?: Record<string, unknown>
          limit?: number
        }

        // Validate that the field exists in the Orama schema to avoid
        // internal crashes (e.g., toString on undefined for unindexed fields).
        const schemaFields = flattenSchema(fastify.pinorama.db.schema)
        if (!schemaFields.has(field)) {
          res.code(400).send({
            error: `field "${field}" is not in the database schema`,
            availableFields: [...schemaFields]
          })
          return
        }

        const result = await search(fastify.pinorama.db, {
          ...(where ? { where } : {}),
          limit: 0,
          facets: {
            [field]: {
              limit,
              order: "DESC"
            }
          },
          preflight: true
        } as any)

        const facetData = (result as any).facets?.[field]
        if (!facetData) {
          res.code(200).send({ values: [] })
          return
        }

        const values: Array<{
          value: string
          count: number
          metric?: number
        }> = []

        const facetValues = facetData.values as Record<string, number>
        for (const [value, count] of Object.entries(facetValues)) {
          const entry: { value: string; count: number; metric?: number } = {
            value,
            count
          }

          if (metric && metric.fn !== "count") {
            const hits = await search(fastify.pinorama.db, {
              where: {
                ...where,
                [field]: {
                  eq: Number.isNaN(Number(value)) ? value : Number(value)
                }
              },
              limit: count
            } as any)

            const numericValues = hits.hits
              .map((h: any) => {
                const parts = metric.field.split(".")
                let val: any = h.document
                for (const part of parts) {
                  val = val?.[part]
                }
                return typeof val === "number" ? val : null
              })
              .filter((v: any): v is number => v !== null)

            if (numericValues.length > 0) {
              switch (metric.fn) {
                case "avg":
                  entry.metric =
                    numericValues.reduce((a: number, b: number) => a + b, 0) /
                    numericValues.length
                  break
                case "min":
                  entry.metric = Math.min(...numericValues)
                  break
                case "max":
                  entry.metric = Math.max(...numericValues)
                  break
              }
            }
          }

          values.push(entry)
        }

        res.code(200).send({ values })
      } catch (e) {
        req.log.error(e)
        res.code(500).send({
          error: "failed to aggregate data",
          details: serializeError(e)
        })
      }
    }
  })
}
