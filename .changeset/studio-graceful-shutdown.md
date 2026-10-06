---
"pinorama-studio": minor
---

Shut down gracefully on `SIGINT`/`SIGTERM`: piped logs still buffered in the transport are delivered and the embedded server is closed before exiting. `--server-db-path` now works as documented: the database is restored on start and saved on exit. It no longer defaults to `<tmpdir>/pinorama.msp`; without the flag logs stay in memory.
