import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Maximize01Icon,
  MouseLeftClick01Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { AnyOrama } from "@orama/orama"
import type { PinoramaDocument } from "pinorama-types"
import { JsonView } from "react-json-view-lite"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"

import "./styles/json-viewer.css"
import {
  forwardRef,
  type Ref,
  useImperativeHandle,
  useMemo,
  useRef
} from "react"
import { useIntl } from "react-intl"
import {
  ClipboardButton,
  type ImperativeClipboardButtonHandle
} from "@/components/clipboard-button/clipboard-button"
import { IconButton } from "@/components/icon-button/icon-button"
import { Separator } from "@/components/ui/separator"
import { useModuleHotkeys } from "@/hooks/use-module-hotkeys"
import LogExplorerModule from "@/modules/log-explorer"

const style = {
  container: "json-view-container",
  basicChildStyle: "basic-element-style",
  label: "label",
  clickableLabel: "clickable-label",
  nullValue: "value-null",
  undefinedValue: "value-undefined",
  stringValue: "value-string",
  booleanValue: "value-boolean",
  numberValue: "value-number",
  otherValue: "value-other",
  punctuation: "punctuation",
  collapseIcon: "collapse-icon",
  expandIcon: "expand-icon",
  collapsedContent: "collapsed-content",
  noQuotesForStringValues: false
}

type LogDetailsProps = {
  data: PinoramaDocument<AnyOrama> | null
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onMaximize: () => void
  canNext?: boolean
  canPrevious?: boolean
}

export type ImperativeLogDetailsHandle = {
  copyToClipboard: () => void
}

export const LogDetails = forwardRef(function LogDetails(
  props: LogDetailsProps,
  ref: Ref<ImperativeLogDetailsHandle>
) {
  const intl = useIntl()
  const moduleHotkeys = useModuleHotkeys(LogExplorerModule)

  const copyButtonRef = useRef<ImperativeClipboardButtonHandle>(null)

  const displayData = useMemo(() => {
    if (!props.data) return null
    const { _pinorama, ...rest } = props.data as Record<string, unknown>
    return rest
  }, [props.data])

  const hotkeys = {
    maximizeDetails: moduleHotkeys.getHotkey("maximizeDetails"),
    copyToClipboard: moduleHotkeys.getHotkey("copyToClipboard"),
    selectNextRow: moduleHotkeys.getHotkey("selectNextRow"),
    selectPreviousRow: moduleHotkeys.getHotkey("selectPreviousRow"),
    showDetails: moduleHotkeys.getHotkey("showDetails")
  }

  useImperativeHandle(
    ref,
    () => ({
      copyToClipboard: () => {
        copyButtonRef.current?.copyToClipboard()
      }
    }),
    []
  )

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar  */}
      <div className="p-3 bg-background border-b border-border overflow-auto">
        <div className="flex justify-between items-center space-x-1.5 whitespace-nowrap">
          <IconButton
            variant="ghost"
            aria-label={hotkeys.maximizeDetails?.description}
            tooltip={hotkeys.maximizeDetails?.description}
            keystroke={hotkeys.maximizeDetails?.keystroke}
            icon={Maximize01Icon}
            onClick={props.onMaximize}
          />
          <div className="flex items-center justify-end">
            <div className="space-x-1.5">
              <ClipboardButton
                ref={copyButtonRef}
                textToCopy={JSON.stringify(displayData, null, 2)}
                keystroke={hotkeys.copyToClipboard?.keystroke}
              />
              <IconButton
                disabled={!props.canNext}
                variant="ghost"
                aria-label={hotkeys.selectNextRow?.description}
                tooltip={hotkeys.selectNextRow?.description}
                keystroke={hotkeys.selectNextRow?.keystroke}
                icon={ArrowDown01Icon}
                onClick={props.onNext}
              />
              <IconButton
                disabled={!props.canPrevious}
                variant="ghost"
                aria-label={hotkeys.selectPreviousRow?.description}
                tooltip={hotkeys.selectPreviousRow?.description}
                keystroke={hotkeys.selectPreviousRow?.keystroke}
                icon={ArrowUp01Icon}
                onClick={props.onPrevious}
              />
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <IconButton
              variant="ghost"
              aria-label={hotkeys.showDetails?.description}
              tooltip={hotkeys.showDetails?.description}
              keystroke={hotkeys.showDetails?.keystroke}
              icon={Cancel01Icon}
              onClick={props.onClose}
            />
          </div>
        </div>
      </div>

      {/* JSON Viewer */}
      <div className="flex flex-col flex-1 overflow-auto">
        {!props.data ? (
          <Empty>
            <EmptyHeader className="max-w-[250px]">
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={MouseLeftClick01Icon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>
                {intl.formatMessage({
                  id: "logExplorer.noDataSelected.title"
                })}
              </EmptyTitle>
              <EmptyDescription>
                {intl.formatMessage({
                  id: "logExplorer.noDataSelected.message"
                })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : displayData ? (
          <JsonView data={displayData} style={style} clickToExpandNode={true} />
        ) : null}
      </div>
    </div>
  )
})
