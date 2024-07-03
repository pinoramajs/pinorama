import {
  usePinoramaDocs,
  usePinoramaIntrospection
  // usePinoramaStyles
} from "@/hooks"
import { Docs } from "./components/docs"

function App() {
  // const { data: styles } = usePinoramaStyles()
  const { data: introspection } = usePinoramaIntrospection()
  const { data: docs } = usePinoramaDocs()

  if (!docs || !introspection) return null

  return <Docs docs={docs} introspection={introspection} />
}

export default App
