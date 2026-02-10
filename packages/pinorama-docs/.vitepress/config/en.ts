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
        text: "Packages",
        link: "/packages/studio",
        activeMatch: "/packages/"
      },
      {
        text: "Advanced",
        link: "/advanced/presets",
        activeMatch: "/advanced/"
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
          }
        ]
      },
      {
        text: "Packages",
        items: [
          {
            text: "Studio",
            link: "/packages/studio"
          },
          {
            text: "Server",
            link: "/packages/server"
          },
          {
            text: "Transport",
            link: "/packages/transport"
          },
          {
            text: "Client",
            link: "/packages/client"
          }
        ]
      },
      {
        text: "Advanced",
        items: [
          {
            text: "Presets",
            link: "/advanced/presets"
          },
          {
            text: "Persistence",
            link: "/advanced/persistence"
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
