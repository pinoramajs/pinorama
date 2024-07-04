import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useFacet } from "../hooks/use-facet"

type FacetProps = {
  propertyName: string
}

export function Facet(props: FacetProps) {
  const { data: facet, isLoading } = useFacet(props.propertyName)
  const [open, setOpen] = useState(true)

  const handleClick = () => {
    setOpen((prev) => !prev)
  }

  const ChevronIcon = open ? ChevronDown : ChevronRight

  return (
    <div className="">
      <Button
        variant={"ghost"}
        onClick={handleClick}
        className={`w-full text-left justify-start text-sm font-normal px-2 ${open ? "hover:bg-transparent" : "text-muted-foreground"}`}
      >
        <ChevronIcon className="mr-2 w-5 h-5" />
        {props.propertyName}
      </Button>
      {open && !isLoading ? (
        <div className="my-2">
          <div className="border border-muted rounded-md overflow-auto max-h-[246px] my-2">
            {Object.entries(facet?.values || {}).map(([label, count]) => {
              return (
                <div
                  key={label}
                  className="flex items-center space-x-3 py-[6px] px-3 border-b last:border-b-0"
                >
                  <Checkbox
                    id={label}
                    className="hover:bg-muted border-muted-foreground"
                  />
                  <Label
                    htmlFor={label}
                    className="whitespace-nowrap text-muted-foreground font-normal cursor-pointer flex-grow text-ellipsis w-full overflow-hidden leading-tight"
                  >
                    {label}
                  </Label>
                  <Badge
                    variant={"secondary"}
                    className="font-normal text-muted-foreground cursor-pointer"
                  >
                    {count as string}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
