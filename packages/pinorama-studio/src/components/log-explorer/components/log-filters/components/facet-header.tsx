import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, CircleX, LoaderIcon } from "lucide-react"
import type React from "react"

import style from "./facet-header.module.css"

type FacetHeaderProps = {
  name: string
  loading: boolean
  count: number
  open: boolean
  onClick: () => void
  onCountClick: (e: React.MouseEvent) => void
}

export function FacetHeader(props: FacetHeaderProps) {
  const ChevronIcon = props.open ? ChevronDown : ChevronRight
  return (
    <Button
      variant="ghost"
      onClick={props.onClick}
      className={`${style.container} ${props.open ? "hover:bg-transparent" : "text-muted-foreground"}`}
    >
      <div className={style.loaderContainer}>
        <ChevronIcon className={style.chevron} />
        {props.name}
        {props.loading ? <LoaderIcon className={style.loaderIcon} /> : null}
      </div>
      {props.count > 0 ? (
        <div>
          <Button
            variant="outline"
            size="badge"
            className={style.countButton}
            onClick={props.onCountClick}
          >
            <CircleX className={style.circle} />
            <div className={style.counter}>{props.count}</div>
          </Button>
        </div>
      ) : null}
    </Button>
  )
}
