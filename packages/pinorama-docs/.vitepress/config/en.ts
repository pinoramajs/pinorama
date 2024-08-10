import { defineConfig } from "vitepress"
import { version } from "../../../pinorama-studio/package.json"

export const en = defineConfig({
  lang: "en-US",

  themeConfig: {
    nav: [
      {
        text: "Guide",
        link: "/guide/",
        activeMatch: "/guide/"
      },
      {
        text: "Studio",
        link: "/guide/pinorama-studio/",
        activeMatch: "/guide/pinorama-studio/"
      },
      {
        text: "Client",
        link: "/guide/pinorama-client/",
        activeMatch: "/guide/pinorama-client/"
      },
      {
        text: "Server",
        link: "/guide/pinorama-server/",
        activeMatch: "/guide/pinorama-server/"
      },
      {
        text: "Transport",
        link: "/guide/pinorama-transport/",
        activeMatch: "/guide/pinorama-transport/"
      },
      {
        text: `v${version}`,
        items: [
          {
            text: `v${version} (studio)`,
            link: "/"
          },
          {
            text: "Release Notes",
            link: "https://github.com/pinoramajs/pinorama/releases"
          }
        ]
      }
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          {
            text: "Overview",
            link: "/guide/"
          },
          {
            text: "Quick Start",
            link: "/guide/quick-start"
          },
          {
            text: "Use Cases",
            link: "/guide/use-cases"
          }
        ]
      },
      {
        text: "Studio ⭐",
        items: [
          {
            text: "Overview",
            link: "/pinorama-studio"
          },
          {
            text: "Installation",
            link: "/pinorama-studio/installation"
          },
          {
            text: "Usage",
            link: "/pinorama-studio/usage"
          },
          {
            text: "CLI",
            link: "/pinorama-studio/api"
          }
        ]
      },
      {
        text: "Client",
        items: [
          {
            text: "Overview",
            link: "/pinorama-client"
          },
          {
            text: "Installation",
            link: "/pinorama-client/installation"
          },
          {
            text: "Usage",
            link: "/pinorama-client/usage"
          },
          {
            text: "API Reference",
            link: "/pinorama-client/api"
          }
        ]
      },
      {
        text: "Server",
        items: [
          {
            text: "Overview",
            link: "/pinorama-server"
          },
          {
            text: "Installation",
            link: "/pinorama-server/installation"
          },
          {
            text: "Configuration",
            link: "/pinorama-server/configuration"
          },
          {
            text: "API Reference",
            link: "/pinorama-server/api"
          }
        ]
      },
      {
        text: "Transport",
        items: [
          {
            text: "Overview",
            link: "/pinorama-transport"
          },
          {
            text: "Installation",
            link: "/pinorama-transport/installation"
          },
          {
            text: "Usage",
            link: "/pinorama-transport/usage"
          }
        ]
      }
    ],

    footer: {
      message: "Open Source ❤ MIT Licensed",
      copyright: "© 2024 Francesco Pasqua & Contributors"
    },

    docFooter: {
      prev: "Previous page",
      next: "Next page"
    }
  }
})
