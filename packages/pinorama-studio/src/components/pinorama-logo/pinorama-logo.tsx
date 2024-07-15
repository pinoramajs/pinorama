import { Shell } from "lucide-react"
import { FormattedMessage } from "react-intl"

import style from "./pinorama-logo.module.css"

export function PinoramaLogo() {
  return (
    <div className={style.container}>
      <Shell className={style.shell} />
      <div className="leading-tight">
        <FormattedMessage id="app.name" />
        <small className={style.version}>
          <FormattedMessage
            id="app.version"
            values={{ version: import.meta.env.PACKAGE_VERSION }}
          />
        </small>
      </div>
    </div>
  )
}
