import "./styles/globals.css"

import {
  RouterProvider,
  type SyncRouteComponent,
  createRootRoute,
  createRoute,
  createRouter,
  redirect
} from "@tanstack/react-router"
import { type ComponentType, StrictMode } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  AppConfigProvider,
  I18nProvider,
  PinoramaClientProvider,
  ThemeProvider
} from "@/contexts"
import App from "./app"
import features from "./features"

const rootRoute = createRootRoute({
  component: App
})

const routes = features.map((feature) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: feature.routePath,
    component: feature.component as SyncRouteComponent<ComponentType>
  })
)

const router = createRouter({
  routeTree: rootRoute.addChildren(routes),
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  notFoundRoute: createRoute({
    id: "not-found",
    getParentRoute: () => rootRoute,
    beforeLoad: () => redirect({ to: "/" })
  })
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
