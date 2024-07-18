import { TitleBar } from "@/components/title-bar"
import { Outlet } from "@tanstack/react-router"

export default function App() {
  return (
    <div className="h-screen w-full grid grid-rows-[48px_1fr]">
      <TitleBar />
      <Outlet />
    </div>
  )
}
