import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { forwardRef } from "react"
import { Kbd } from "../kbd"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

type SearchInputProps = {
  value: string
  onChange: (text: string) => void
  placeholder: string
  keystroke?: string
}

export const SearchInput = forwardRef(function SearchInput(
  props: SearchInputProps,
  ref: React.Ref<HTMLInputElement>
) {
  const hasValue = props.value.length > 0

  return (
    <div className="relative flex items-center w-full">
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={2}
        className="h-4 w-4 absolute left-3 text-muted-foreground"
      />
      <Input
        ref={ref}
        type="text"
        placeholder={props.placeholder}
        className="pl-9 pr-16"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && e.target instanceof HTMLInputElement) {
            e.target.blur()
          }
        }}
      />
      {hasValue ? (
        <Button
          variant={"ghost"}
          size={"xs"}
          aria-label="Clear"
          className="absolute right-8"
          onClick={() => props.onChange("")}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            className="h-4 w-4"
          />
        </Button>
      ) : null}
      {props.keystroke ? (
        <Kbd className="absolute right-2">{props.keystroke}</Kbd>
      ) : null}
    </div>
  )
})
