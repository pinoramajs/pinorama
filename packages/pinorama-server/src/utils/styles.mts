import { kebabCase } from "change-case"

type CSSProperties = Record<string, string | number>

type ValueStyles = Record<string, CSSProperties>

type StyleDefinition = CSSProperties | [CSSProperties, ValueStyles]

type Styles = { [key: string]: StyleDefinition }

export function generateCSS(styles: Styles = {}) {
  return Object.entries(styles).map(generateCSSForField).join("")
}

const generateCSSForField = ([field, style]: [string, StyleDefinition]) => {
  let fieldCSS = ""

  const className = `pinorama-${kebabCase(field)}`

  if (Array.isArray(style)) {
    const [baseStyles, valueStyles] = style

    // Generate base style
    fieldCSS += `.${className} {`
    fieldCSS += generateCSSProps(baseStyles)
    fieldCSS += "}\n"

    // Generate value styles
    for (const [value, valueStyle] of Object.entries(valueStyles)) {
      fieldCSS += `.${className}-${kebabCase(value)} {`
      fieldCSS += generateCSSProps(valueStyle)
      fieldCSS += "}\n"
    }
  } else {
    // Generate base style
    fieldCSS += `.${className} {`
    fieldCSS += generateCSSProps(style)
    fieldCSS += "}\n"
  }

  return fieldCSS
}

const generateCSSProps = (style: CSSProperties = {}) => {
  return Object.entries(style)
    .map(([cssProp, value]) => `${kebabCase(cssProp)}: ${value};`)
    .join("")
}
