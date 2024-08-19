import { FormattedMessage } from "react-intl"

export function PinoramaLogo() {
  return (
    <div className="flex items-center space-x-1.5 font-medium">
      <img src="/pinorama-logo.webp" width={18} height={18} alt="Pinorama" />
      <div className="leading-tight">
        <FormattedMessage id="app.name" />{" "}
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
