import { cn } from "@/lib/utils"

type EmptyStateProps = {
  message: string
  className?: string
}

export function EmptyState(props: EmptyStateProps) {
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
