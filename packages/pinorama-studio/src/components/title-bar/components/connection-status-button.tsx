import { useState } from "react"
import { FormattedMessage } from "react-intl"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { useAppConfig } from "@/contexts"
import { ConnectionStatus, usePinoramaConnection } from "@/hooks"

const formSchema = z.object({
  connectionUrl: z.string().url("Invalid URL")
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
  const { connectionStatus } = usePinoramaConnection()

  const [open, setOpen] = useState(false)
  const [connectionUrl, setConnectionUrl] = useState(
    appConfig?.config.connectionUrl || ""
  )
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const handleOpen = (value: boolean) => {
    if (value) {
      setConnectionUrl(appConfig?.config.connectionUrl || "")
      setError(null)
      setIsDirty(false)
    }
    setOpen(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConnectionUrl(e.target.value)
    setIsDirty(true)
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = formSchema.safeParse({ connectionUrl })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    appConfig?.setConfig({
      ...appConfig.config,
      connectionUrl: result.data.connectionUrl
    })
    setOpen(false)
  }

  const handleReset = () => {
    setConnectionUrl(appConfig?.config.connectionUrl || "")
    setError(null)
    setIsDirty(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <Button
            variant={"ghost"}
            size={"sm"}
            className="flex h-8 items-center space-x-1.5"
          />
        }
      >
        <div
          className={`w-2 h-2 rounded-full ${STATUS_COLOR[connectionStatus]}`}
        />
        <span className="">
          <FormattedMessage id={`connection.status.${connectionStatus}`} />
        </span>
        <span className="text-muted-foreground">
          {appConfig?.config.connectionUrl ?? "Unknown"}
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field data-invalid={!!error}>
            <FieldLabel>
              <FormattedMessage id="connection.labels.serverUrl" />
            </FieldLabel>
            <Input
              value={connectionUrl}
              onChange={handleChange}
              aria-invalid={!!error}
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={"outline"}
              disabled={!isDirty}
              onClick={handleReset}
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
