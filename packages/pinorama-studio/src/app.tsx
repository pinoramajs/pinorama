import { Outlet } from "@tanstack/react-router"
import { TitleBar } from "@/components/title-bar"

export default function App() {
  return (
    <div className="h-screen w-full grid grid-rows-[40px_1fr]">
      <TitleBar />
      <Outlet />
    </div>
  )
}
