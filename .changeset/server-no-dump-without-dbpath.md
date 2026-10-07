---
"pinorama-server": patch
---

Skip the save on close when `dbPath` is not configured. It used to write an `orama_bump_<timestamp>` dump file into the current directory.
