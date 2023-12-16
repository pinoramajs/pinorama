import abstractTransport from "pino-abstract-transport"
import PinoramaClient from "pinorama-client"

type PinoramaTransportOptions = {}

export default async function pinoramaTransport(
  options: PinoramaTransportOptions
) {
  const client = new PinoramaClient()
}
