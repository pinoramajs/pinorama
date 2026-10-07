---
"pinorama-studio": patch
---

Pick the UI language from the browser settings (`navigator.languages`), as the docs always said. A value stored in `localStorage.locale` still wins; unsupported values are ignored instead of breaking the translations.
