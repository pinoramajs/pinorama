import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  CancelCircleIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { AnySchema } from "@orama/orama"
import type { PinoramaIntrospection } from "pinorama-types"
import type React from "react"
import { Button } from "@/components/ui/button"
import { createField } from "@/lib/introspection"

type FacetHeaderProps = {
  introspection: PinoramaIntrospection<AnySchema>
  name: string
  count: number
  open: boolean
  onClick: () => void
  onCountClick: (e: React.MouseEvent) => void
}

export function FacetHeader(props: FacetHeaderProps) {
  const field = createField(props.name, props.introspection)
  const chevronIcon = props.open ? ArrowDown01Icon : ArrowRight01Icon

  return (
    <Button
      variant={"ghost"}
      onClick={props.onClick}
      className={`w-full text-left justify-between text-sm font-normal px-2 ${props.open ? "hover:bg-transparent" : "text-muted-foreground"}`}
    >
      <div className="flex items-center">
        <HugeiconsIcon
          icon={chevronIcon}
          strokeWidth={2}
          className="mr-2 w-5 h-5"
        />
        {field.getDisplayLabel()}
      </div>
      {props.count > 0 ? (
        <Button
          render={<div />}
          variant={"outline"}
          size={"xs"}
          className="flex text-muted-foreground rounded-full"
          onClick={props.onCountClick}
        >
          <HugeiconsIcon
            icon={CancelCircleIcon}
            strokeWidth={2}
            className="w-4 h-4"
          />
          <div className="px-1.5 text-xs">{props.count}</div>
        </Button>
      ) : null}
    </Button>
  )
}
