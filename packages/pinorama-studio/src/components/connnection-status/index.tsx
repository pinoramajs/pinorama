import { usePinoramaIntrospection } from "@/hooks"

export function ConnectionStatus() {
  const { status } = usePinoramaIntrospection()

  let statusColor = ""
  let statusText = ""

  switch (status) {
    case "pending":
      statusColor = "bg-orange-500"
      statusText = "Connecting"
      break
    case "success":
      statusColor = "bg-green-500"
      statusText = "Connected"
      break
    case "error":
      statusColor = "bg-red-500"
      statusText = "Connection timed out"
      break
    default:
      statusColor = "bg-gray-500"
      statusText = "Unknown"
  }

  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-2 h-2 rounded-full ${statusColor}`} />
      <span className="">{statusText}</span>
      <span className="text-muted-foreground">
        http://localhost:6200/pinorama
      </span>
    </div>
  )
}
