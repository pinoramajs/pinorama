import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  DatabaseIcon,
  MemoryStickIcon
} from "lucide-react"
import type { PinoramaStats } from "pinorama-client"
import { useIntl } from "react-intl"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { PAGE_SIZE_OPTIONS } from "@/modules/log-explorer/constants"

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / 1024 ** i
  return `${value.toFixed(1)} ${units[i]}`
}

function Value({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground">{children}</span>
}

type StatusBarProps = {
  liveMode: boolean
  page: number
  pageSize: number
  totalCount: number
  bufferCount: number
  bufferMax: number
  stats?: PinoramaStats
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function StatusBar(props: StatusBarProps) {
  const intl = useIntl()

  const totalPages = Math.max(1, Math.ceil(props.totalCount / props.pageSize))
  const from = props.totalCount === 0 ? 0 : props.page * props.pageSize + 1
  const to = Math.min((props.page + 1) * props.pageSize, props.totalCount)
  const isBufferFull = props.bufferCount >= props.bufferMax

  return (
    <div className="flex items-center h-8 whitespace-nowrap px-3 text-xs text-muted-foreground border-t bg-background shrink-0 gap-3">
      {props.liveMode ? (
        <span className="flex items-center gap-1.5">
          Buffer: <Value>{props.bufferCount.toLocaleString()}</Value> /{" "}
          <Value>{props.bufferMax.toLocaleString()}</Value>
          {isBufferFull && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangleIcon className="h-3.5 w-3.5 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent>
                {intl.formatMessage({
                  id: "logExplorer.statusBar.bufferFull"
                })}
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      ) : (
        <>
          <span>
            {intl.formatMessage({ id: "logExplorer.statusBar.showing" })}{" "}
            <Value>
              {from.toLocaleString()}-{to.toLocaleString()}
            </Value>{" "}
            / <Value>{props.totalCount.toLocaleString()}</Value>
          </span>

          <span className="text-border">|</span>

          <div className="flex items-center gap-1">
            <span>
              {intl.formatMessage({ id: "logExplorer.statusBar.page" })}{" "}
              <Value>{props.page + 1}</Value> / <Value>{totalPages}</Value>
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => props.onPageChange(0)}
                  disabled={props.page === 0}
                  aria-label={intl.formatMessage({
                    id: "logExplorer.statusBar.firstPage"
                  })}
                >
                  <ChevronsLeftIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {intl.formatMessage({
                  id: "logExplorer.statusBar.firstPage"
                })}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => props.onPageChange(props.page - 1)}
                  disabled={props.page === 0}
                  aria-label={intl.formatMessage({
                    id: "logExplorer.statusBar.previousPage"
                  })}
                >
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {intl.formatMessage({
                  id: "logExplorer.statusBar.previousPage"
                })}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => props.onPageChange(props.page + 1)}
                  disabled={props.page >= totalPages - 1}
                  aria-label={intl.formatMessage({
                    id: "logExplorer.statusBar.nextPage"
                  })}
                >
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {intl.formatMessage({
                  id: "logExplorer.statusBar.nextPage"
                })}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => props.onPageChange(totalPages - 1)}
                  disabled={props.page >= totalPages - 1}
                  aria-label={intl.formatMessage({
                    id: "logExplorer.statusBar.lastPage"
                  })}
                >
                  <ChevronsRightIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {intl.formatMessage({
                  id: "logExplorer.statusBar.lastPage"
                })}
              </TooltipContent>
            </Tooltip>
          </div>

          <span className="text-border">|</span>

          <div className="flex items-center gap-1.5">
            <span>
              {intl.formatMessage({
                id: "logExplorer.statusBar.rowsPerPage"
              })}
            </span>
            <Select
              value={String(props.pageSize)}
              onValueChange={(v) => props.onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-6 min-w-[70px] text-xs border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem
                    key={size}
                    value={String(size)}
                    className="text-xs"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <span className="ml-auto" />

      {props.stats && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1">
                <DatabaseIcon className="h-3.5 w-3.5" />
                <Value>{props.stats.totalDocs.toLocaleString()}</Value>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {intl.formatMessage({ id: "logExplorer.statusBar.dbDocs" })}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1">
                <MemoryStickIcon className="h-3.5 w-3.5" />
                <Value>{formatBytes(props.stats.memoryUsage)}</Value>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {intl.formatMessage({ id: "logExplorer.statusBar.memory" })}
            </TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  )
}
