import { createPreset } from "../utils.mjs"

export const pino = createPreset(
  {
    time: "number",
    level: "enum",
    msg: "string",
    pid: "enum",
    hostname: "string"
  },
  {
    facets: {
      level: "enum",
      msg: "string",
      pid: "enum",
      hostname: "string"
    },
    columns: {
      time: { visible: true, size: 150 },
      level: { visible: true, size: 70 },
      msg: { visible: true, size: 400 },
      pid: { visible: false, size: 70 },
      hostname: { visible: false, size: 150 }
    },
    labels: {
      time: "Time",
      level: [
        "Level",
        {
          10: "TRACE",
          20: "DEBUG",
          30: "INFO",
          40: "WARN",
          50: "ERROR",
          60: "FATAL"
        }
      ],
      msg: "Message",
      pid: "PID",
      hostname: "Host"
    },
    formatters: {
      time: "timestamp"
    },
    styles: {
      time: {
        opacity: "0.5"
      },
      level: [
        {},
        {
          10: { color: "var(--color-gray-500)" },
          20: { color: "var(--color-purple-500)" },
          30: { color: "var(--color-lime-500)" },
          40: { color: "var(--color-yellow-500)" },
          50: { color: "var(--color-red-500)" },
          60: { color: "var(--color-red-500)" }
        }
      ]
    }
  }
)
