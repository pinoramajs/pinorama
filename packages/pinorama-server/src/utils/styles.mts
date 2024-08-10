import { kebabCase } from "change-case"

type CSSProperties = Record<string, string | number>

type ValueStyles = Record<string, CSSProperties>

type StyleDefinition = CSSProperties | [CSSProperties, ValueStyles]

type Styles = { [key: string]: StyleDefinition }

export function generateCSS(styles: Styles = {}) {
  return Object.entries(styles).map(generateCSSForField).join("")
}

const createFieldCss = (className: string, style: CSSProperties) => {
  return `.${className} {
${generateCSSProps(style)}
}
`
}

const generateCSSForField = ([field, style]: [string, StyleDefinition]) => {
  let fieldCSS = ""

  const className = `pinorama-${kebabCase(field)}`

  if (Array.isArray(style)) {
    const [baseStyles, valueStyles] = style

    // Generate base style
    fieldCSS += createFieldCss(className, baseStyles)

    // Generate value styles
    for (const [value, valueStyle] of Object.entries(valueStyles)) {
      fieldCSS += createFieldCss(`${className}-${kebabCase(value)}`, valueStyle)
    }
  } else {
    // Generate base style
    fieldCSS += createFieldCss(className, style)
  }

  return fieldCSS
}

const generateCSSProps = (style: CSSProperties = {}) => {
  return Object.entries(style)
    .map(([cssProp, value]) => `${kebabCase(cssProp)}: ${value};`)
    .join("")
}
