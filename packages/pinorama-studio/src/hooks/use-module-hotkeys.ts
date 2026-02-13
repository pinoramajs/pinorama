import type { ComponentType } from "react"
import { useIntl } from "react-intl"
import type { Module } from "@/lib/modules"
import modules from "@/modules"

type ModuleHotkey = {
  method: string
  keystroke: string
  description: string
}

type ModuleMethod<M extends Module<ComponentType>> = keyof NonNullable<
  M["hotkeys"]
>

const keystrokeDisplayMap: Record<string, string> = {
  slash: "/"
}

function formatKeystroke(key: string): string {
  return keystrokeDisplayMap[key] ?? key
}

export function useModuleHotkeys<M extends Module<ComponentType>>(module: M) {
  const intl = useIntl()

  const hotkeysMap = (() => {
    const hotkeys: Partial<Record<ModuleMethod<M>, ModuleHotkey>> = {}

    const mod = modules.find((m) => m.id === module.id)
    if (!mod || !mod.hotkeys) return hotkeys

    for (const [method, key] of Object.entries(mod.hotkeys)) {
      hotkeys[method as ModuleMethod<M>] = {
        method,
        keystroke: formatKeystroke(key as string),
        description: intl.formatMessage({ id: `${mod.id}.hotkeys.${method}` })
      }
    }

    return hotkeys
  })()

  const getHotkey = (method: ModuleMethod<M>) => hotkeysMap[method]

  return { hotkeys: hotkeysMap, getHotkey }
}

export function useAllModuleHotkeys() {
  const intl = useIntl()

  const hotkeys: Record<string, ModuleHotkey[]> = {}

  for (const mod of modules) {
    if (!mod.hotkeys) continue

    const moduleTitle = intl.formatMessage({ id: `${mod.id}.title` })

    hotkeys[moduleTitle] = Object.entries(mod.hotkeys).map(([method, key]) => ({
      method,
      keystroke: formatKeystroke(key as string),
      description: intl.formatMessage({ id: `${mod.id}.hotkeys.${method}` })
    }))
  }

  return hotkeys
}
