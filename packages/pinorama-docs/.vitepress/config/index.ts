import { defineConfig } from "vitepress"
import { en } from "./en"

export default defineConfig({
  title: "Pinorama",

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  head: [["link", { rel: "icon", href: "/pinorama-logo.webp" }]],

  themeConfig: {
    logo: "/pinorama-logo.webp",

    socialLinks: [
      { icon: "github", link: "https://github.com/pinoramajs/pinorama" }
    ],

    search: {
      provider: "local"
    }
  },

  locales: {
    root: { label: "English", ...en }
  },

  ignoreDeadLinks: false
})
