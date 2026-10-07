---
"pinorama-transport": patch
---

Deliver the logs still buffered when the stream ends or is destroyed before it emits `close`, so consumers that wait for the stream to close (pino's worker thread, a CLI shutting down) no longer exit with the last batch in flight.
