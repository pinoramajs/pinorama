import { format } from "date-fns"

export const timestamp = (value: string) => {
  return format(new Date(value), "MMM dd HH:mm:ss")
}
