import { Shell } from "lucide-react"

export function PinoramaLogo() {
  return (
    <div className="flex items-center space-x-1.5 font-medium">
      <Shell className="h-[18px] w-[18px]" />
      <div className="leading-tight">
        Pinorama{" "}
        <small className="text-xs font-normal text-muted-foreground">
          v{import.meta.env.PACKAGE_VERSION}
        </small>
      </div>
    </div>
  )
}
