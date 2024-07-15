import { cn } from "@/lib/utils"
import type { ElementType } from "react"
import { Button } from "../ui/button"

import style from './empty-state.module.css';

type EmptyStateProps = {
  message: string
  className?: string
}

export function EmptyStateInline(props: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex items-center h-10 p-3 m-2 text-sm border rounded-md text-muted-foreground",
        props.className
      )}
    >
      {props.message}
    </div>
  )
}

type ButtonProps = {
  text: string
  onClick: () => void
}

type EmptyStateBlockProps = {
  icon: ElementType
  title: string
  message: string
  buttons?: ButtonProps[]
}

export function EmptyStateBlock({
  icon: Icon,
  title,
  message,
  buttons
}: EmptyStateBlockProps) {
  return (
    <div className={style.blockContainer}>
      <div className={style.blockContent}>
        <div className={style.iconContainer}>
          <Icon className={style.icon} />
        </div>
        <div className={style.titleContainer}>{title}</div>
        <div className={style.messageContainer}>{message}</div>
        <div className={style.buttonsContainer}>
          {buttons?.map((button) => (
            <Button
              key={button.text}
              variant="default"
              size="sm"
              className="mt-1"
              onClick={button.onClick}
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
