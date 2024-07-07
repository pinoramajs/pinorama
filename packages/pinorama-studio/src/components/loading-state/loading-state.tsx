import { LoaderIcon } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex items-center h-10 p-3 my-2 text-sm text-muted-foreground">
      <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
      Loading...
    </div>
  )
}
