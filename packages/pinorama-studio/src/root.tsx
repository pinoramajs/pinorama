import "./styles/globals.css"

import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  RouterProvider
} from "@tanstack/react-router"
import { StrictMode } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  AppConfigProvider,
  I18nProvider,
  PinoramaClientProvider,
  ThemeProvider
} from "@/contexts"
import App from "./app"
import modules from "./modules"

const rootRoute = createRootRoute({
  component: App,
  notFoundComponent: () => <Navigate to="/" />
})

const routes = modules.map((mod) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: mod.routePath,
    component: mod.component
  })
)

const router = createRouter({
  routeTree: rootRoute.addChildren(routes),
  defaultPreload: "intent",
  defaultStaleTime: 5000
})

export function RootComponent() {
  return (
    <StrictMode>
      <I18nProvider>
        <AppConfigProvider>
          <PinoramaClientProvider>
            <ThemeProvider>
              <TooltipProvider>
                <RouterProvider router={router} />
              </TooltipProvider>
            </ThemeProvider>
          </PinoramaClientProvider>
        </AppConfigProvider>
      </I18nProvider>
    </StrictMode>
  )
}
