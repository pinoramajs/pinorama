import { useLogs } from "@/hooks"

function App() {
  const { data } = useLogs()
  return <div className="p-4">{JSON.stringify(data)}</div>
}

export default App
