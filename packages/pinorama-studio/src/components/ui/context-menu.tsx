import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({ ...props }: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuContent({
  className,
  ...props
}: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="isolate z-50 outline-none">
        <MenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-lg p-1 shadow-md ring-1 duration-100 z-50 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm data-inset:pl-7 [&_svg:not([class*='size-'])]:size-4 group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="absolute right-2 flex items-center justify-center pointer-events-none"
        data-slot="context-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuSeparator
}
