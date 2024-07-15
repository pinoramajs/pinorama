import { LoaderIcon } from "lucide-react"
import { FormattedMessage } from "react-intl"

import style from "./loading-state.module.css"

export function LoadingState() {
  return (
    <div className={style.container}>
      <LoaderIcon className={style.icon} />
      <FormattedMessage id="labels.loading" />
    </div>
  )
}
