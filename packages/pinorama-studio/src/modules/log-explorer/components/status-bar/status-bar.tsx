import { cn } from "@/lib/utils"
import {
  ClockIcon,
  FileTextIcon,
  FilterIcon,
  LinkIcon,
  type LucideIcon,
  RadioIcon,
  SearchIcon
} from "lucide-react"

type StatusBarItemProps = {
  icon: LucideIcon
  children: React.ReactNode
}

function StatusBarItem(props: StatusBarItemProps) {
  const Icon = props.icon
  return (
    <span className="flex items-center space-x-1">
      <Icon className="w-3 h-3 mr-1" />
      {props.children}
    </span>
  )
}

type StatusBarProps = {
  total: number
  found: number
  filters: number
  live: boolean
}

export function StatusBar(props: StatusBarProps) {
  return (
    <div
      className={cn(
        "flex justify-between p-1 px-2 border-border border-t text-xs text-muted-foreground bg-muted/20",
        true && "bg-blue-600 text-white border-blue-600"
      )}
    >
      {/* left */}
      <div className="flex space-x-4">
        <StatusBarItem icon={FileTextIcon}>{props.total}</StatusBarItem>
        <StatusBarItem icon={SearchIcon}>{props.found}</StatusBarItem>
        <StatusBarItem icon={FilterIcon}>{props.filters}</StatusBarItem>
        {/* <StatusBarItem icon={ClockIcon}>5 minutes ago</StatusBarItem> */}
        {/* <StatusBarItem icon={RadioIcon}>Live</StatusBarItem> */}
      </div>
      {/* right */}
      <div className="flex space-x-4">
        <StatusBarItem icon={LinkIcon}>
          Connected to: localhost:6200
        </StatusBarItem>
      </div>
    </div>
  )
}
