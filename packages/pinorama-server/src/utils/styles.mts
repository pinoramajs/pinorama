import { kebabCase } from "change-case"

type StyleConfig = {
  base?: Record<string, string>
  conditions?: Record<string | number, Record<string, string>>
}

type ColumnnDefinition =
  | [string, { style: StyleConfig; formatter?: string }]
  | string

export function generateCSS(columns: ColumnnDefinition[]) {
  let css = ""

  const generateCSSProps = (styles: Record<string, string>) => {
    let props = ""
    for (const [prop, value] of Object.entries(styles)) {
      props += `${kebabCase(prop)}: ${value};`
    }
    return props
  }

  for (const column of columns) {
    if (typeof column === "string") continue

    const prefix = "pinorama-col"
    const [className, config] = column
    const baseStyles = config.style?.base ?? {}
    const conditions = config.style?.conditions ?? {}

    // Generate base style
    css += `.${prefix}-${kebabCase(className)} {`
    css += generateCSSProps(baseStyles)
    css += "}\n"

    // Generate conditional style
    for (const [condition, conditionStyles] of Object.entries(conditions)) {
      css += `.${prefix}-${kebabCase(className)}-${condition} {`
      css += generateCSSProps(conditionStyles)
      css += "}\n"
    }
  }

  return css
}
