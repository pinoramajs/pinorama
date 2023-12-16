import { Readable } from "stream"
import { PinoramaClient } from "../packages/pinorama-client"

function generateLog(): any {
  return {
    timestamp: new Date().toISOString(),
    level: "info",
    message: "pinorama log line!"
  }
}

function simulateLogStream(
  stream: Readable,
  interval: number,
  totalLogs: number
): void {
  let count = 0
  const logInterval = setInterval(() => {
    if (count >= totalLogs) {
      clearInterval(logInterval)
      stream.push(null)
    } else {
      stream.push(JSON.stringify(generateLog()))
      count++
    }
  }, interval)
}

const pinoramaClient = new PinoramaClient({
  baseUrl: "http://localhost:3000",
  maxRetries: 3,
  retryInterval: 1000
})

const logStream = new Readable({
  read() {}
})

const totalLogsToSend = 100000
const logIntervalMilliseconds = 10
simulateLogStream(logStream, logIntervalMilliseconds, totalLogsToSend)

pinoramaClient.bulkInsert(logStream, { batchSize: 1000, flushInterval: 5000 })
