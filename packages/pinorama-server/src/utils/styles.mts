import { kebabCase } from "change-case"
import type { IntrospectionStyle } from "pinorama-types"

type CSSProperties = Record<string, string | number>

export function generateCSS(styles: Record<string, IntrospectionStyle>) {
  return Object.entries(styles).map(generateCSSForField).join("")
}

const createFieldCss = (className: string, style: CSSProperties) => {
  return `.${className} {
${generateCSSProps(style)}
}
`
}

const generateCSSForField = ([field, style]: [string, IntrospectionStyle]) => {
  const className = `pinorama-${kebabCase(field)}`

  if (!Array.isArray(style)) {
    return createFieldCss(className, style)
  }

  const [baseStyles, valueStyles] = style

  let fieldCSS = createFieldCss(className, baseStyles)

  for (const [value, valueStyle] of Object.entries(valueStyles)) {
    fieldCSS += createFieldCss(`${className}-${kebabCase(value)}`, valueStyle)
  }

  return fieldCSS
}

const generateCSSProps = (style: CSSProperties = {}) => {
  return Object.entries(style)
    .map(([cssProp, value]) => `${kebabCase(cssProp)}: ${value};`)
    .join("")
}
