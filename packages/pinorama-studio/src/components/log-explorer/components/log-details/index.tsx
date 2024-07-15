import style from "./log-details.module.css"

type LogDetailsProps = {
  data: any
}

export function LogDetails(props: LogDetailsProps) {
  return (
    <div className={style.container}>
      <pre className="text-sm">{JSON.stringify(props.data, null, 2)}</pre>
    </div>
  )
}
