import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app.tsx"
import "./globals.css"

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
