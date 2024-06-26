import { format } from "date-fns"

type LogLineProps = {
  log: {
    req?: {
      method: string
      url: string
    }
    time: string
    level: number
    msg: string
  }
}

export function LogLine({ log }: LogLineProps) {
  const levels: Record<number, { label: string; className: string }> = {
    60: { label: "fatal", className: "text-red-900" },
    50: { label: "error", className: "text-red-600" },
    40: { label: "warn", className: "text-yellow-500" },
    30: { label: "info", className: "text-blue-500" },
    20: { label: "debug", className: "text-green-500" },
    10: { label: "trace", className: "text-gray-500" }
  }

  const { label, className } = levels[log.level]

  return (
    <>
      <span className="text-gray-500">{format(log.time, "Pp")}</span>
      {log.req ? (
        <>
          <span>
            {log.req.method} {log.req.url}
          </span>
        </>
      ) : null}
      <span className={`uppercase ${className}`}>{label}</span>
      <span>{log.msg}</span>
    </>
  )
}
