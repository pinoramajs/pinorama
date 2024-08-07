import { defineConfig } from "vitepress"
import { version } from "../../../pinorama-studio/package.json"

export const en = defineConfig({
  lang: "en-US",

  themeConfig: {
    nav: [
      {
        text: "Guide",
        link: "/guide/getting-started/",
        activeMatch: "/guide/getting-started/"
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
            text: "Release Notes",
            link: "https://github.com/pinoramajs/pinorama/releases"
          }
        ]
      }
    ],

    footer: {
      message: "Open Source ❤ MIT Licensed",
      copyright: "© 2024 Francesco Pasqua & Contributors"
    },

    docFooter: {
      prev: "Next",
      next: "Previous"
    }
  }
})
