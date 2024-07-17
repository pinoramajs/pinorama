import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { useAppConfig } from "@/contexts"
import { usePinoramaIntrospection } from "@/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormattedMessage } from "react-intl"
import { z } from "zod"

const formSchema = z.object({
  connectionUrl: z.string().url("Invalid URL")
})

export function ConnectionStatusButton() {
  const appConfig = useAppConfig()
  const { status, fetchStatus } = usePinoramaIntrospection()

  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connectionUrl: appConfig?.config.connectionUrl || ""
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    appConfig?.setConfig({
      ...appConfig.config,
      connectionUrl: values.connectionUrl
    })

    setOpen(false)
  }

  let statusColor = ""
  let statusText = ""

  const connectionStatus = appConfig?.config.connectionStatus

  switch (true) {
    case connectionStatus === "disconnected":
      statusColor = "bg-gray-500"
      statusText = "disconnected"
      break
    case status === "pending" && fetchStatus === "fetching":
      statusColor = "bg-orange-500"
      statusText = "connecting"
      break
    case status === "success":
      statusColor = "bg-green-500"
      statusText = "connected"
      break
    case status === "error":
      statusColor = "bg-red-500"
      statusText = "connectionFailed"
      break
    default:
      statusColor = "bg-gray-500"
      statusText = "unknown"
      break
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="flex h-8 items-center space-x-1.5"
        >
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="">
            <FormattedMessage id={`connectionStatus.${statusText}`} />
          </span>
          <span className="text-muted-foreground">
            {appConfig?.config.connectionUrl ?? "Unknown"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="connectionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="server.url" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-start justify-between w-full space-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={!form.formState.isDirty}
                onClick={() => form.reset()}
                className="w-full"
              >
                <FormattedMessage id="actions.reset" />
              </Button>
              <Button type="submit" className="w-full">
                <FormattedMessage id="actions.save" />
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
