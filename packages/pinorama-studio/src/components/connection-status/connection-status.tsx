import { useState } from "react"

import { useAppConfig } from "@/contexts"
import { usePinoramaIntrospection } from "@/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const formSchema = z.object({
  connectionUrl: z.string().url("Invalid URL")
})

export function ConnectionStatus() {
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
      statusText = "Disconnected"
      break
    case status === "pending" && fetchStatus === "fetching":
      statusColor = "bg-orange-500"
      statusText = "Connecting..."
      break
    case status === "success":
      statusColor = "bg-green-500"
      statusText = "Connected"
      break
    case status === "error":
      statusColor = "bg-red-500"
      statusText = "Connection failed"
      break
    default:
      statusColor = "bg-gray-500"
      statusText = "Unknown"
      break
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} className="flex h-8 items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="">{statusText}</span>
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
                  <FormLabel>Server URL</FormLabel>
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
                Reset
              </Button>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
