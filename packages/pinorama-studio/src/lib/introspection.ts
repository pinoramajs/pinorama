import type { AnySchema } from "@orama/orama"
import { format } from "date-fns"
import type { PinoramaIntrospection } from "pinorama-types"

export function createField(
  fieldName: string,
  introspection: PinoramaIntrospection<AnySchema>
) {
  const label = introspection.labels?.[fieldName]
  const style = introspection.styles?.[fieldName]
  const formatter = introspection.formatters?.[fieldName]

  return {
    getDisplayLabel() {
      return Array.isArray(label) ? label?.[0] : label ? label : fieldName
    },
    getValueLabel(value: string | number) {
      if (this.hasValueLabels()) {
        return label?.[1][value as number] ?? value
      }
      return value
    },
    hasValueStyle() {
      return Array.isArray(style)
    },
    hasValueLabels() {
      return Array.isArray(label) && label.length === 2
    },
    getClassName(value: string | number) {
      const css: string[] = []

      if (!style) return css

      const className = `pinorama-${fieldName}`
      css.push(className)

      if (this.hasValueStyle()) {
        const [, valueStyles] = style as any

        const valueStyle = valueStyles[value]
        if (valueStyle) {
          css.push(`${className}-${value}`)
        }
      }

      return css
    },
    format(value: string | number) {
      if (formatter === "timestamp") {
        return format(new Date(value), "MMM dd HH:mm:ss")
      }

      if (this.hasValueLabels()) {
        return this.getValueLabel(value)
      }

      return value
    }
  }
}
