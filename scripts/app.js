const METHODS_AND_URLS = [
  ["GET", "/api/users"],
  ["GET", "/api/users/:id"],
  ["POST", "/api/users"],
  ["PUT", "/api/users/:id"],
  ["DELETE", "/api/users/:id"],
  ["GET", "/api/products"],
  ["GET", "/api/products/:id"],
  ["POST", "/api/products"],
  ["GET", "/api/orders"],
  ["GET", "/api/orders/:id"],
  ["POST", "/api/orders"],
  ["PATCH", "/api/orders/:id/status"],
  ["GET", "/api/health"],
  ["GET", "/api/metrics"],
  ["POST", "/api/auth/login"],
  ["POST", "/api/auth/logout"],
  ["POST", "/api/auth/refresh"],
  ["GET", "/api/search?q=keyword"],
  ["POST", "/api/webhooks/stripe"],
  ["POST", "/api/uploads"],
  ["GET", "/api/config"],
  ["GET", "/api/notifications"],
  ["POST", "/api/notifications/send"],
  ["DELETE", "/api/sessions/:id"]
]

const APP_MESSAGES = {
  30: [
    "Server listening on port 3000",
    "Database connection established",
    "Cache warmed up successfully",
    "Background job scheduler started",
    "WebSocket connection opened",
    "Configuration reloaded from disk",
    "Health check passed",
    "Metrics exported to Prometheus",
    "Email queue processed: 12 messages sent",
    "Cron job completed: cleanup_sessions"
  ],
  20: [
    "JWT token verified for user_482",
    "Cache hit for key products:featured",
    "Rate limiter: 42/100 requests used for 192.168.1.42",
    "Database pool stats: active=3 idle=7 waiting=0",
    "Request body validated against schema",
    "CORS preflight handled for origin https://app.example.com",
    "Session extended for user_128, expires in 3600s"
  ],
  40: [
    "Slow query detected: SELECT * FROM orders WHERE ... took 2847ms",
    "Rate limit approaching for IP 192.168.1.42 (85/100)",
    "Deprecated endpoint /api/v1/users called, migrate to /api/v2/users",
    "Connection pool running low: 2 idle connections remaining",
    "Disk usage at 87%, consider cleanup",
    "JWT token expires in less than 5 minutes for user_301",
    "Retry attempt 2/5 for external service payment-gateway"
  ],
  10: [
    "Entering middleware: authenticate",
    "Parsing request body: application/json, 1.2KB",
    "Resolving route: GET /api/users/:id -> UserController.findById",
    "Serializing response: 847 bytes"
  ]
}

const ERRORS = [
  {
    message: "Connection refused: redis://localhost:6379",
    stack:
      "Error: Connection refused: redis://localhost:6379\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1595:16)\n    at RedisClient.connect (node_modules/ioredis/built/Redis.js:210:28)\n    at CacheService.get (src/services/cache.ts:45:18)\n    at UserController.findById (src/controllers/user.ts:28:22)"
  },
  {
    message: "Unique constraint violation on users.email",
    stack:
      "Error: Unique constraint violation on users.email\n    at PostgresError.parse (node_modules/postgres/src/errors.js:24:13)\n    at handle (node_modules/postgres/src/connection.js:728:25)\n    at UserRepository.create (src/repositories/user.ts:34:16)\n    at UserController.create (src/controllers/user.ts:52:20)"
  },
  {
    message: "Payment gateway timeout after 30000ms",
    stack:
      "Error: Payment gateway timeout after 30000ms\n    at AbortError.create (node_modules/undici/lib/core/errors.js:85:15)\n    at Timeout._onTimeout (node_modules/undici/lib/api/api-request.js:124:21)\n    at PaymentService.charge (src/services/payment.ts:67:24)\n    at OrderController.create (src/controllers/order.ts:41:18)"
  },
  {
    message: "Cannot read properties of undefined (reading 'id')",
    stack:
      "TypeError: Cannot read properties of undefined (reading 'id')\n    at OrderService.getById (src/services/order.ts:23:31)\n    at OrderController.findById (src/controllers/order.ts:15:28)\n    at Router.handle (node_modules/fastify/lib/router.js:171:28)\n    at authenticate (src/middleware/auth.ts:18:5)"
  },
  {
    message: "ECONNRESET: socket hang up",
    stack:
      "Error: ECONNRESET: socket hang up\n    at connResetException (node:internal/errors:720:14)\n    at TLSSocket.socketOnEnd (node:_http_client:518:23)\n    at TLSSocket.emit (node:events:530:35)\n    at ExternalService.fetch (src/services/external.ts:89:18)"
  }
]

const FATAL_MESSAGES = [
  "Uncaught exception: process out of memory, heap limit reached",
  "FATAL: database system is shutting down",
  "Worker thread crashed: segmentation fault in native module"
]

const REMOTE_ADDRESSES = [
  "192.168.1.42",
  "10.0.0.15",
  "172.16.0.8",
  "192.168.1.100",
  "10.0.0.23"
]
const WEIGHTED_LEVELS = [
  30, 30, 30, 30, 30, 30, 20, 20, 20, 40, 40, 50, 50, 10, 60
]

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

let reqCounter = 0

function log(level, obj, msg) {
  const entry = {
    level,
    time: Date.now(),
    pid: process.pid,
    hostname: "api-server-01",
    ...obj
  }
  if (msg) entry.msg = msg
  process.stdout.write(`${JSON.stringify(entry)}\n`)
}

function generateRequestLog() {
  reqCounter++
  const reqId = `req-${String(reqCounter).padStart(4, "0")}`
  const [method, url] = pick(METHODS_AND_URLS)
  const remoteAddress = pick(REMOTE_ADDRESSES)
  const remotePort = rand(30000, 65000)
  const level = pick(WEIGHTED_LEVELS)

  const req = {
    method,
    url,
    hostname: "api.example.com",
    remoteAddress,
    remotePort
  }

  let responseTime
  const r = Math.random()
  if (r < 0.7) responseTime = rand(1, 50)
  else if (r < 0.93) responseTime = rand(50, 500)
  else responseTime = rand(500, 5000)

  let statusCode
  if (level >= 60) statusCode = 503
  else if (level >= 50) statusCode = pick([500, 502, 503])
  else if (level >= 40) statusCode = pick([400, 401, 403, 404, 429])
  else statusCode = pick([200, 200, 200, 201, 204, 304])

  const res = { statusCode }

  if (level >= 50) {
    const error = pick(ERRORS)
    log(
      level,
      {
        reqId,
        req,
        res,
        responseTime,
        err: { type: "Error", message: error.message, stack: error.stack }
      },
      error.message
    )
  } else {
    log(level, { reqId, req, res, responseTime }, "request completed")
  }
}

function generateAppLog() {
  const level = pick(WEIGHTED_LEVELS)

  if (level >= 60) {
    log(60, {}, pick(FATAL_MESSAGES))
    return
  }
  if (level >= 50) {
    const error = pick(ERRORS)
    log(
      50,
      { err: { type: "Error", message: error.message, stack: error.stack } },
      error.message
    )
    return
  }

  const messages = APP_MESSAGES[level] || APP_MESSAGES[30]
  log(level, {}, pick(messages))
}

const interval = Number(process.env.INTERVAL || 1000)

let timer

setTimeout(() => {
  log(30, {}, "Server listening on port 3000")
  timer = setInterval(() => {
    if (Math.random() < 0.7) generateRequestLog()
    else generateAppLog()
  }, interval)
}, 1000)

process.on("SIGINT", () => {
  clearInterval(timer)
  process.exit(0)
})
