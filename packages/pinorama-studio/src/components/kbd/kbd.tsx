import { cn } from "@/lib/utils"

export function Kbd({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <kbd
      className={cn(
        "h-5 items-center rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground opacity-100",
        className
      )}
    >
      {children}
    </kbd>
  )
}
