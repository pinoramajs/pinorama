import ReactDOM from "react-dom/client"
import { RootComponent } from "./root"

const appElement = document.getElementById("app") as HTMLElement
ReactDOM.createRoot(appElement).render(<RootComponent />)
