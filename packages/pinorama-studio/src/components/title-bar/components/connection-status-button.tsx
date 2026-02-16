import { Globe02Icon, SquareLock02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQueryState } from "nuqs"
import { useState } from "react"
import { FormattedMessage } from "react-intl"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { useAppConfig } from "@/contexts"
import { ConnectionStatus, usePinoramaConnection } from "@/hooks"
import { serverUrlParam } from "@/lib/search-params"

const formSchema = z.object({
  serverUrl: z.string().url("Invalid URL"),
  adminSecret: z.string().optional()
})

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Disconnected]: "bg-gray-500",
  [ConnectionStatus.Connecting]: "bg-orange-500",
  [ConnectionStatus.Connected]: "bg-green-500",
  [ConnectionStatus.Failed]: "bg-red-500",
  [ConnectionStatus.Unknown]: "bg-gray-500"
}

export function ConnectionStatusButton() {
  const appConfig = useAppConfig()
  const [serverUrl, setServerUrl] = useQueryState("serverUrl", serverUrlParam)
  const { connectionStatus, connectionError } = usePinoramaConnection()

  const [open, setOpen] = useState(false)
  const [formUrl, setFormUrl] = useState(serverUrl)
  const [adminSecret, setAdminSecret] = useState(appConfig?.adminSecret ?? "")
  const [showAuth, setShowAuth] = useState(!!appConfig?.adminSecret)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const resetForm = () => {
    setFormUrl(serverUrl)
    setAdminSecret(appConfig?.adminSecret ?? "")
    setShowAuth(!!appConfig?.adminSecret)
    setError(null)
    setIsDirty(false)
  }

  const handleOpen = (value: boolean) => {
    if (value) resetForm()
    setOpen(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = formSchema.safeParse({
      serverUrl: formUrl,
      adminSecret: showAuth ? adminSecret : ""
    })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    setServerUrl(result.data.serverUrl)
    appConfig?.setAdminSecret(result.data.adminSecret || null)
    setOpen(false)
  }

  const statusDetail =
    connectionStatus === ConnectionStatus.Failed && connectionError
      ? connectionError.message
      : (serverUrl ?? "Unknown")

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="flex h-8 items-center space-x-1.5"
          />
        }
      >
        <div
          className={`w-2 h-2 rounded-full ${STATUS_COLOR[connectionStatus]}`}
        />
        <span>
          <FormattedMessage id={`connection.status.${connectionStatus}`} />
        </span>
        <span className="text-muted-foreground">{statusDetail}</span>
      </PopoverTrigger>
      <PopoverContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field data-invalid={!!error}>
            <FieldLabel>
              <FormattedMessage id="connection.labels.serverUrl" />
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                required
                value={formUrl}
                onChange={(e) => {
                  setFormUrl(e.target.value)
                  setIsDirty(true)
                  setError(null)
                }}
                placeholder="http://localhost:6200"
                aria-invalid={!!error}
              />
              <InputGroupAddon align="inline-end">
                <HugeiconsIcon icon={Globe02Icon} className="size-4" />
              </InputGroupAddon>
            </InputGroup>
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="enable-auth"
              checked={showAuth}
              onCheckedChange={(checked) => {
                setShowAuth(!!checked)
                if (!checked) setAdminSecret("")
                setIsDirty(true)
              }}
            />
            <FieldLabel htmlFor="enable-auth">
              <FormattedMessage id="connection.labels.enableAuth" />
            </FieldLabel>
          </Field>
          {showAuth && (
            <Field>
              <FieldLabel>
                <FormattedMessage id="connection.labels.adminSecret" />
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  type="password"
                  value={adminSecret}
                  onChange={(e) => {
                    setAdminSecret(e.target.value)
                    setIsDirty(true)
                  }}
                />
                <InputGroupAddon align="inline-end">
                  <HugeiconsIcon icon={SquareLock02Icon} className="size-4" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!isDirty}
              onClick={resetForm}
            >
              <FormattedMessage id="connection.labels.reset" />
            </Button>
            <Button type="submit">
              <FormattedMessage id="connection.labels.save" />
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
