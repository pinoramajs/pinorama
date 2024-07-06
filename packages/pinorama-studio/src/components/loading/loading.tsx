import { LoaderIcon } from "lucide-react"

export function Loading() {
  return (
    <div className="flex items-center text-muted-foreground text-sm">
      <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
      Loading...
    </div>
  )
}
