import {
  type ComponentRef,
  type ComponentType,
  useEffect,
  useRef,
  useState
} from "react"
import { useHotkeys } from "react-hotkeys-hook"
import type { ImportMessages } from "@/i18n"

export type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

export type Hotkeys<T> = Record<MethodKeys<T>, string>

export type Module<T extends ComponentType> = {
  id: string
  routePath: string
  component: T
  messages?: ImportMessages
  hotkeys?: Hotkeys<ComponentRef<T>>
}

export function createModule<T extends ComponentType>(
  mod: Module<T>
): Module<T> {
  return mod.hotkeys
    ? { ...mod, component: withHotkeys(mod.component, mod.hotkeys) }
    : mod
}

function withHotkeys<T extends ComponentType>(
  WrappedComponent: T,
  hotkeys: Hotkeys<ComponentRef<T>>
): T {
  function ComponentWithHotkeys(props: any) {
    const ref = useRef<ComponentRef<T>>(null)
    const [hotkeyEnabled, setHotkeyEnabled] = useState(true)

    useEffect(() => {
      const attrName = "data-scroll-locked"

      const checkDataAttribute = () => {
        const bodyDataAttribute = document.body.getAttribute(attrName)
        setHotkeyEnabled(bodyDataAttribute !== "1")
      }

      checkDataAttribute()

      const observer = new MutationObserver(checkDataAttribute)
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: [attrName]
      })

      return () => observer.disconnect()
    }, [])

    for (const [method, key] of Object.entries(hotkeys)) {
      // biome-ignore lint/correctness/useHookAtTopLevel: hotkeys are static per module, the loop count never changes
      useHotkeys(
        key as string,
        (event) => {
          event.preventDefault()
          if (ref.current) {
            const func = ref.current[method as keyof ComponentRef<T>]
            if (typeof func === "function") {
              func.call(ref.current)
            } else {
              console.warn(`Method '${method}' not found or not a function`)
            }
          }
        },
        {
          enabled: hotkeyEnabled
        }
      )
    }

    return <WrappedComponent ref={ref} {...props} />
  }

  return ComponentWithHotkeys as T
}
