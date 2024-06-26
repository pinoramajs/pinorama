import { useLogs } from "@/hooks"
import { useVirtualizer } from "@tanstack/react-virtual"
import { format } from "date-fns"
import { useRef } from "react"

function LogLine({ log }: { log: any }) {
  const levels = {
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

function App() {
  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: 200000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 20
  })

  const { data } = useLogs()

  if (!data) return null

  return (
    <>
      <div ref={parentRef} className="h-screen overflow-auto">
        <div
          className="w-full relative"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            return (
              <div
                key={virtualItem.key}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`
                }}
                className="absolute top-0 left-0 w-full whitespace-nowrap font-mono text-xs flex items-center space-x-4"
              >
                <LogLine log={data[virtualItem.index]} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default App
