import { Shell } from "lucide-react"
import { FormattedMessage } from "react-intl"

export function PinoramaLogo() {
  return (
    <div className="flex items-center space-x-1.5 font-medium">
      <Shell className="h-[18px] w-[18px]" />
      <div className="leading-tight">
        <FormattedMessage id="app.name" />
        <small className="text-xs font-normal text-muted-foreground">
          <FormattedMessage
            id="app.version"
            values={{ version: import.meta.env.PACKAGE_VERSION }}
          />
        </small>
      </div>
    </div>
  )
}
