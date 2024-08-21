import { Button } from "@/components/ui/button"
import { usePinoramaConnection } from "@/hooks"
import { createField } from "@/lib/introspection"
import { ChevronDown, ChevronRight, CircleX, LoaderIcon } from "lucide-react"
import type React from "react"

type FacetHeaderProps = {
  name: string
  loading: boolean
  count: number
  open: boolean
  onClick: () => void
  onCountClick: (e: React.MouseEvent) => void
}

export function FacetHeader(props: FacetHeaderProps) {
  const { introspection } = usePinoramaConnection()

  if (!introspection) {
    return null
  }

  const field = createField(props.name, introspection)
  const ChevronIcon = props.open ? ChevronDown : ChevronRight

  return (
    <Button
      variant={"ghost"}
      onClick={props.onClick}
      className={`w-full text-left justify-between text-sm font-normal px-2 ${props.open ? "hover:bg-transparent" : "text-muted-foreground"}`}
    >
      <div className="flex items-center">
        <ChevronIcon className="mr-2 w-5 h-5" />
        {field.getDisplayLabel()}
        {props.loading ? (
          <LoaderIcon className="w-4 h-4 ml-2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      {props.count > 0 ? (
        <Button
          asChild
          variant={"outline"}
          size={"badge"}
          className="flex text-muted-foreground"
          onClick={props.onCountClick}
        >
          <div>
            <CircleX className="w-4 h-4" />
            <div className="px-1.5 text-xs">{props.count}</div>
          </div>
        </Button>
      ) : null}
    </Button>
  )
}
