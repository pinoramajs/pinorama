import { kebabCase } from "change-case"

type CSSProperties = {
  [key: string]: string | number
}

type ValueStyles = {
  [key: string]: CSSProperties
}

type StyleDefinition = CSSProperties | [CSSProperties, ValueStyles]

type Styles = { [key: string]: StyleDefinition }

export function generateCSS(styles: Styles) {
  return Object.entries(styles)
    .map(([field, style]) => generateCSSForField(field, style))
    .join("")
}

const generateCSSForField = (field: string, style: StyleDefinition) => {
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

const generateCSSProps = (style: CSSProperties) => {
  return Object.entries(style)
    .map(([cssProp, value]) => `${kebabCase(cssProp)}: ${value};`)
    .join("")
}
