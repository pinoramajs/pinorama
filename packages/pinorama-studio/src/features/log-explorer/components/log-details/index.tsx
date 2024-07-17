type LogDetailsProps = {
  data: any
}

export function LogDetails(props: LogDetailsProps) {
  return (
    <div className="flex flex-col h-full p-3 overflow-auto">
      <pre className="text-sm">{JSON.stringify(props.data, null, 2)}</pre>
    </div>
  )
}
