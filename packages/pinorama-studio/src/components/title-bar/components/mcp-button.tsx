import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQueryState } from "nuqs"
import { useState } from "react"
import { FormattedMessage, useIntl } from "react-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMcpStatus, usePinoramaConnection } from "@/hooks"
import { serverUrlParam } from "@/lib/search-params"

function CopyButton({ text }: { text: string }) {
  const intl = useIntl()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      aria-label={intl.formatMessage({ id: "labels.copyToClipboard" })}
      className="h-7 w-7 p-0 shrink-0"
    >
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        className="size-3.5"
      />
    </Button>
  )
}

type ClientTab = {
  id: string
  labelKey: string
  hintKey: string
  codeBlock: string
}

function useClientTabs(mcpEndpoint: string): ClientTab[] {
  const mcpConfig = JSON.stringify(
    { mcpServers: { pinorama: { url: mcpEndpoint } } },
    null,
    2
  )

  const cursorConfig = JSON.stringify(
    { mcpServers: { pinorama: { type: "http", url: mcpEndpoint } } },
    null,
    2
  )

  return [
    {
      id: "claudeCode",
      labelKey: "mcp.clients.claudeCode",
      hintKey: "mcp.setup.claudeCode",
      codeBlock: `claude mcp add --transport http pinorama ${mcpEndpoint}`
    },
    {
      id: "vscode",
      labelKey: "mcp.clients.vscode",
      hintKey: "mcp.setup.vscode",
      codeBlock: mcpConfig
    },
    {
      id: "cursor",
      labelKey: "mcp.clients.cursor",
      hintKey: "mcp.setup.cursor",
      codeBlock: cursorConfig
    },
    {
      id: "other",
      labelKey: "mcp.clients.other",
      hintKey: "mcp.setup.other",
      codeBlock: mcpEndpoint
    }
  ]
}

function McpSetupDialog({
  mcpEndpoint,
  open,
  onOpenChange
}: {
  mcpEndpoint: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const intl = useIntl()
  const clientTabs = useClientTabs(mcpEndpoint)
  const [activeTab, setActiveTab] = useState("claudeCode")

  const activeCode = clientTabs.find((t) => t.id === activeTab)?.codeBlock ?? ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id="mcp.labels.setupGuide" />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage id="mcp.labels.setupDescription" />
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted rounded-lg overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/50 px-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="gap-0"
            >
              <TabsList variant="line" className="h-10">
                {clientTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                    {intl.formatMessage({ id: tab.labelKey })}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <CopyButton text={activeCode} />
          </div>
          <pre className="px-4 py-3 text-xs overflow-x-auto break-all whitespace-pre-wrap">
            {activeCode}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function McpButton() {
  const { isConnected } = usePinoramaConnection()
  const { enabled, toggle } = useMcpStatus()
  const [serverUrl] = useQueryState("serverUrl", serverUrlParam)
  const [dialogOpen, setDialogOpen] = useState(false)

  const mcpEndpoint = `${serverUrl}/mcp`

  if (!isConnected) return null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>
          {enabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
          <FormattedMessage id="mcp.title" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!enabled ? (
            <DropdownMenuItem onClick={toggle}>
              <FormattedMessage id="mcp.actions.enable" />
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                <FormattedMessage id="mcp.actions.help" />
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={toggle}>
                <FormattedMessage id="mcp.actions.disable" />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <McpSetupDialog
        mcpEndpoint={mcpEndpoint}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
