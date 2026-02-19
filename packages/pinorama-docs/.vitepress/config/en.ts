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
          },
          {
            text: "MCP",
            link: "/packages/mcp"
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
      message: "Released under the MIT License",
      copyright:
        'Copyright © 2024-present <a href="https://cesco.me">Francesco Pasqua</a>'
    },

    editLink: {
      pattern:
        "https://github.com/pinoramajs/pinorama/edit/main/packages/pinorama-docs/:path",
      text: "Edit this page on GitHub"
    },

    docFooter: {
      prev: "Previous page",
      next: "Next page"
    }
  }
})
