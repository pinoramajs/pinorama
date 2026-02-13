import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { forwardRef, useCallback, useImperativeHandle, useState } from "react"
import { useIntl } from "react-intl"
import { IconButton } from "../icon-button/icon-button"

type ClipboardButtonProps = {
  textToCopy: string
  keystroke?: string
}

export type ImperativeClipboardButtonHandle = {
  copyToClipboard: () => void
}

export const ClipboardButton = forwardRef<
  ImperativeClipboardButtonHandle,
  ClipboardButtonProps
>(function ClipboardButton(props, ref) {
  const intl = useIntl()
  const [isCopied, setIsCopied] = useState(false)

  const handleClick = useCallback(async () => {
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
  }, [props.textToCopy, isCopied])

  useImperativeHandle(
    ref,
    () => ({
      copyToClipboard: handleClick
    }),
    [handleClick]
  )

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
})
