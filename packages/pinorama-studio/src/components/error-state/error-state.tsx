import { cn } from "@/lib/utils"
import { FormattedMessage } from "react-intl"

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
      <div className="text-red-500 mr-2">
        <span className="font-medium">
          <FormattedMessage id="labels.inlineError" />
        </span>
      </div>
      <div className="text-foreground">{props.error.message}</div>
    </div>
  )
}
