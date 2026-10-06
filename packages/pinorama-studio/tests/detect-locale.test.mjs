import { describe, expect, it } from "vitest"
import { detectLocale } from "../src/i18n/detect-locale.ts"

describe("detectLocale", () => {
  it("uses the stored locale when it is supported", () => {
    expect(detectLocale("it", ["en-US"])).toBe("it")
  })

  it("ignores a stored locale that is not supported", () => {
    expect(detectLocale("fr", ["en-US"])).toBe("en")
  })

  it("matches a browser language by its base tag", () => {
    expect(detectLocale(null, ["it-IT", "en-US"])).toBe("it")
  })

  it("uses the first supported browser language", () => {
    expect(detectLocale(null, ["fr-FR", "it", "en"])).toBe("it")
  })

  it("falls back to english", () => {
    expect(detectLocale(null, ["fr-FR"])).toBe("en")
    expect(detectLocale(null, [])).toBe("en")
  })
})
