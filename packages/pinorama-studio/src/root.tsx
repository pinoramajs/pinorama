import "./styles/globals.css"

import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  RouterProvider
} from "@tanstack/react-router"
import { NuqsAdapter } from "nuqs/adapters/react"
import { StrictMode } from "react"

import { Toaster } from "@/components/ui/sonner"
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
      <NuqsAdapter>
        <I18nProvider>
          <AppConfigProvider>
            <PinoramaClientProvider>
              <ThemeProvider>
                <TooltipProvider delay={700}>
                  <RouterProvider router={router} />
                  <Toaster />
                </TooltipProvider>
              </ThemeProvider>
            </PinoramaClientProvider>
          </AppConfigProvider>
        </I18nProvider>
      </NuqsAdapter>
    </StrictMode>
  )
}
