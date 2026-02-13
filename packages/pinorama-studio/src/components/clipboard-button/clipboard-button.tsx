import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { useImperativeHandle, useState } from "react"
import { useIntl } from "react-intl"
import { IconButton } from "../icon-button/icon-button"

type ClipboardButtonProps = {
  ref?: React.Ref<ImperativeClipboardButtonHandle>
  textToCopy: string
  keystroke?: string
}

export type ImperativeClipboardButtonHandle = {
  copyToClipboard: () => void
}

export function ClipboardButton(props: ClipboardButtonProps) {
  const intl = useIntl()
  const [isCopied, setIsCopied] = useState(false)

  const handleClick = async () => {
    if (isCopied || !props.textToCopy) {
      return
    }

    try {
      await navigator.clipboard.writeText(props.textToCopy)
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, 1500)
    } catch (err) {
      console.error("Failed to copy to clipboard", err)
    }
  }

  useImperativeHandle(props.ref, () => ({
    copyToClipboard: handleClick
  }))

  return (
    <IconButton
      variant="ghost"
      keystroke={props.keystroke}
      disabled={!props.textToCopy}
      icon={isCopied ? Tick02Icon : Copy01Icon}
      aria-label={intl.formatMessage({ id: "labels.copyToClipboard" })}
      tooltip={intl.formatMessage({ id: "labels.copyToClipboard" })}
      onClick={handleClick}
    />
  )
}
