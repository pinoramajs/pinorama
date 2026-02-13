import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { FormattedMessage } from "react-intl"
import { cn } from "@/lib/utils"

type InlineStatusProps = { className?: string } & (
  | { variant: "empty"; message: string }
  | { variant: "loading" }
  | { variant: "error"; error: Error }
)

export function InlineStatus(props: InlineStatusProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-md border border-dashed p-3 text-sm text-muted-foreground",
        props.variant === "error" && "border-solid",
        props.className
      )}
    >
      {props.variant === "loading" && (
        <>
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className="w-4 h-4 mr-2 animate-spin"
          />
          <FormattedMessage id="labels.loading" />
        </>
      )}
      {props.variant === "error" && (
        <>
          <span className="text-red-500 font-medium mr-2">
            <FormattedMessage id="labels.inlineError" />
          </span>
          <span className="text-foreground">{props.error.message}</span>
        </>
      )}
      {props.variant === "empty" && props.message}
    </div>
  )
}
