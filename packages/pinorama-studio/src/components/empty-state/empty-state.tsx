type EmptyStateProps = {
  message: string
}

export function EmptyState(props: EmptyStateProps) {
  return (
    <div className="flex items-center h-10 p-3 my-2 text-sm text-muted-foreground border rounded-md">
      {props.message}
    </div>
  )
}
