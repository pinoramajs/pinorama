import { FormattedMessage } from "react-intl"
import { ConnectionStatus } from "../connection-status/connection-status"
import { ConnectionToggle } from "../connection-toggle/connection-toggle"
import { PinoramaLogo } from "../pinorama-logo/pinorama-logo"
import { ThemeToggle } from "../theme-toggle/theme-toggle"
import { Button } from "../ui/button"

import style from "./title-bar.module.css"

type TitleBarProps = {
  hasFilters: boolean
  onClearFilters: () => void
}

export function TitleBar(props: TitleBarProps) {
  return (
    <div className={style.container}>
      <div className={style.content}>
        {/* Left */}
        <div className={style.left}>
          <PinoramaLogo />
        </div>

        {/* Center */}
        <div className={style.center}>
          <ConnectionStatus />
        </div>

        {/* Right */}
        <div className={style.right}>
          {props.hasFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={props.onClearFilters}
            >
              <FormattedMessage id="filters.clear" />
            </Button>
          )}
          <ConnectionToggle />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
