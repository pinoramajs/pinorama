import type { ElementType } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

type EmptyStateProps = {
  message: string
  className?: string
}

export function EmptyStateInline(props: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex items-center h-10 p-3 m-2 text-sm border rounded-md text-muted-foreground",
        props.className
      )}
    >
      {props.message}
    </div>
  )
}

type ButtonProps = {
  text: string
  onClick: () => void
}

type EmptyStateBlockProps = {
  icon: ElementType
  title: string
  message: string
  buttons?: ButtonProps[]
}

export function EmptyStateBlock({
  icon: Icon,
  title,
  message,
  buttons
}: EmptyStateBlockProps) {
  return (
    <div className="flex items-center justify-center h-full w-full text-center text-sm text-foreground">
      <div className="w-60 flex flex-col items-center -mt-[5%]">
        <div className="bg-muted-foreground/15 p-1.5 rounded-md mb-4">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-muted-foreground mb-3">{message}</div>
        <div className="flex flex-col items-center">
          {buttons?.map((button) => (
            <Button
              key={button.text}
              variant="default"
              size="sm"
              className="mt-1"
              onClick={button.onClick}
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
