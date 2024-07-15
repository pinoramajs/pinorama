import { cn } from "@/lib/utils"
import { FormattedMessage } from "react-intl"

import style from "./error-state.module.css"

type ErrorStateProps = {
  error: Error
  className?: string
}

export function ErrorState(props: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex items-center h-10 p-3 m-2 text-sm border rounded-md",
        props.className
      )}
    >
      <div className={style.messageContainer}>
        <span className="font-medium">
          <FormattedMessage id="labels.error" />
        </span>
      </div>
      <div className="text-foreground">{props.error.message}</div>
    </div>
  )
}
