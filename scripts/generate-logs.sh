#!/usr/bin/env bash
#
# Generate realistic Fastify-style logs and stream them to a pinorama server.
#
# Usage:
#   ./scripts/generate-logs.sh                  # default: 1 log every 200ms
#   INTERVAL=1 ./scripts/generate-logs.sh       # 1 log every second
#   COUNT=500 ./scripts/generate-logs.sh        # generate exactly 500 logs then stop
#   URL=http://localhost:6200 ./scripts/generate-logs.sh
#
set -euo pipefail

INTERVAL="${INTERVAL:-0.2}"
URL="${URL:-http://localhost:6200/pinorama}"
MAX_COUNT="${COUNT:-0}"

PID=$$
HOSTNAME="api-server-01"
REQ_HOSTNAME="api.example.com"
REMOTE_ADDRESSES=("192.168.1.42" "10.0.0.15" "172.16.0.8" "192.168.1.100" "10.0.0.23")

# Weighted level distribution: mostly INFO, some DEBUG, fewer WARN/ERROR, rare TRACE/FATAL
WEIGHTED_LEVELS=(30 30 30 30 30 30 20 20 20 40 40 50 50 10 60)

METHODS_AND_URLS=(
  "GET /api/users"
  "GET /api/users/:id"
  "POST /api/users"
  "PUT /api/users/:id"
  "DELETE /api/users/:id"
  "GET /api/products"
  "GET /api/products/:id"
  "POST /api/products"
  "GET /api/orders"
  "GET /api/orders/:id"
  "POST /api/orders"
  "PATCH /api/orders/:id/status"
  "GET /api/health"
  "GET /api/metrics"
  "POST /api/auth/login"
  "POST /api/auth/logout"
  "POST /api/auth/refresh"
  "GET /api/search?q=keyword"
  "POST /api/webhooks/stripe"
  "POST /api/uploads"
  "GET /api/config"
  "GET /api/notifications"
  "POST /api/notifications/send"
  "DELETE /api/sessions/:id"
)

# Messages for non-request logs (application events)
APP_MESSAGES_INFO=(
  "Server listening on port 3000"
  "Database connection established"
  "Cache warmed up successfully"
  "Background job scheduler started"
  "WebSocket connection opened"
  "Configuration reloaded from disk"
  "Health check passed"
  "Metrics exported to Prometheus"
  "Email queue processed: 12 messages sent"
  "Cron job completed: cleanup_sessions"
)
APP_MESSAGES_DEBUG=(
  "JWT token verified for user_482"
  "Cache hit for key products:featured"
  "Rate limiter: 42/100 requests used for 192.168.1.42"
  "Database pool stats: active=3 idle=7 waiting=0"
  "Request body validated against schema"
  "CORS preflight handled for origin https://app.example.com"
  "Session extended for user_128, expires in 3600s"
)
APP_MESSAGES_WARN=(
  "Slow query detected: SELECT * FROM orders WHERE ... took 2847ms"
  "Rate limit approaching for IP 192.168.1.42 (85/100)"
  "Deprecated endpoint /api/v1/users called, migrate to /api/v2/users"
  "Connection pool running low: 2 idle connections remaining"
  "Disk usage at 87%, consider cleanup"
  "JWT token expires in less than 5 minutes for user_301"
  "Retry attempt 2/5 for external service payment-gateway"
)
APP_MESSAGES_TRACE=(
  "Entering middleware: authenticate"
  "Parsing request body: application/json, 1.2KB"
  "Resolving route: GET /api/users/:id -> UserController.findById"
  "Serializing response: 847 bytes"
)

ERROR_MESSAGES=(
  "Connection refused: redis://localhost:6379"
  "ECONNRESET: socket hang up"
  "Unique constraint violation on users.email"
  "Payment gateway timeout after 30000ms"
  "Invalid JWT: token has expired"
  "ENOMEM: not enough memory for buffer allocation"
  "Foreign key constraint failed on orders.user_id"
  "TLS handshake failed: certificate has expired"
  "Request entity too large: 52MB exceeds 10MB limit"
)

STACK_TRACES=(
  'Error: Connection refused: redis://localhost:6379\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1595:16)\n    at RedisClient.connect (node_modules/ioredis/built/Redis.js:210:28)\n    at CacheService.get (src/services/cache.ts:45:18)\n    at UserController.findById (src/controllers/user.ts:28:22)\n    at Router.handle (node_modules/fastify/lib/router.js:171:28)'
  'Error: Unique constraint violation on users.email\n    at PostgresError.parse (node_modules/postgres/src/errors.js:24:13)\n    at handle (node_modules/postgres/src/connection.js:728:25)\n    at Socket.data (node_modules/postgres/src/connection.js:411:19)\n    at UserRepository.create (src/repositories/user.ts:34:16)\n    at UserController.create (src/controllers/user.ts:52:20)'
  'Error: Payment gateway timeout after 30000ms\n    at AbortError.create (node_modules/undici/lib/core/errors.js:85:15)\n    at Timeout._onTimeout (node_modules/undici/lib/api/api-request.js:124:21)\n    at PaymentService.charge (src/services/payment.ts:67:24)\n    at OrderController.create (src/controllers/order.ts:41:18)\n    at Router.handle (node_modules/fastify/lib/router.js:171:28)'
  'TypeError: Cannot read properties of undefined (reading '"'"'id'"'"')\n    at OrderService.getById (src/services/order.ts:23:31)\n    at OrderController.findById (src/controllers/order.ts:15:28)\n    at Router.handle (node_modules/fastify/lib/router.js:171:28)\n    at next (node_modules/fastify/lib/hooks.js:84:20)\n    at authenticate (src/middleware/auth.ts:18:5)'
  'Error: ECONNRESET: socket hang up\n    at connResetException (node:internal/errors:720:14)\n    at TLSSocket.socketOnEnd (node:_http_client:518:23)\n    at TLSSocket.emit (node:events:530:35)\n    at endReadableNT (node:internal/streams/readable:1696:12)\n    at ExternalService.fetch (src/services/external.ts:89:18)'
)

FATAL_MESSAGES=(
  "Uncaught exception: process out of memory, heap limit reached"
  "FATAL: database system is shutting down"
  "Worker thread crashed: segmentation fault in native module"
)

pick() {
  local arr=("$@")
  echo "${arr[$((RANDOM % ${#arr[@]}))]}"
}

rand_range() {
  local min=$1 max=$2
  echo $(( (RANDOM % (max - min + 1)) + min ))
}

req_counter=0
count=0

cleanup() {
  echo ""
  echo "Generated $count logs, shutting down."
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Streaming Fastify logs to $URL every ${INTERVAL}s (Ctrl+C to stop)"
if [ "$MAX_COUNT" -gt 0 ]; then
  echo "Will stop after $MAX_COUNT logs"
fi

generate_logs() {
  while true; do
    if [ "$MAX_COUNT" -gt 0 ] && [ "$count" -ge "$MAX_COUNT" ]; then
      break
    fi

    level=$(pick "${WEIGHTED_LEVELS[@]}")
    ts=$(( $(date +%s) * 1000 + (RANDOM % 1000) ))
    count=$((count + 1))

    # 70% request logs, 30% application logs
    if [ $((RANDOM % 10)) -lt 7 ]; then
      # --- Request/Response log ---
      req_counter=$((req_counter + 1))
      req_id=$(printf "req-%04d" $req_counter)
      route=$(pick "${METHODS_AND_URLS[@]}")
      method="${route%% *}"
      url="${route#* }"
      remote_addr=$(pick "${REMOTE_ADDRESSES[@]}")
      remote_port=$(rand_range 30000 65000)

      # Determine status code based on level
      case $level in
        10|20|30) status_code=$(pick 200 200 200 200 201 204 304) ;;
        40)       status_code=$(pick 400 401 403 404 429) ;;
        50)       status_code=$(pick 500 502 503 500 500) ;;
        60)       status_code=503 ;;
        *)        status_code=200 ;;
      esac

      # Response time: mostly fast, sometimes slow
      if [ $((RANDOM % 10)) -lt 7 ]; then
        response_time=$(rand_range 1 50)
      elif [ $((RANDOM % 10)) -lt 9 ]; then
        response_time=$(rand_range 50 500)
      else
        response_time=$(rand_range 500 5000)
      fi

      # Request log (incoming)
      if [ $level -le 20 ]; then
        printf '{"level":20,"time":%s,"pid":%d,"hostname":"%s","reqId":"%s","req":{"method":"%s","url":"%s","hostname":"%s","remoteAddress":"%s","remotePort":%d},"msg":"incoming request"}\n' \
          "$ts" "$PID" "$HOSTNAME" "$req_id" "$method" "$url" "$REQ_HOSTNAME" "$remote_addr" "$remote_port"
        sleep "$INTERVAL"
        count=$((count + 1))
        ts=$(( $(date +%s) * 1000 + (RANDOM % 1000) ))
      fi

      # For errors, add stack trace
      if [ $level -ge 50 ]; then
        err_msg=$(pick "${ERROR_MESSAGES[@]}")
        stack=$(pick "${STACK_TRACES[@]}")
        printf '{"level":%d,"time":%s,"pid":%d,"hostname":"%s","reqId":"%s","req":{"method":"%s","url":"%s","hostname":"%s","remoteAddress":"%s","remotePort":%d},"res":{"statusCode":%d},"responseTime":%d,"err":{"type":"Error","message":"%s","stack":"%s"},"msg":"%s"}\n' \
          "$level" "$ts" "$PID" "$HOSTNAME" "$req_id" "$method" "$url" "$REQ_HOSTNAME" "$remote_addr" "$remote_port" "$status_code" "$response_time" "$err_msg" "$stack" "$err_msg"
      else
        # Normal response log
        msg="request completed"
        printf '{"level":%d,"time":%s,"pid":%d,"hostname":"%s","reqId":"%s","req":{"method":"%s","url":"%s","hostname":"%s","remoteAddress":"%s","remotePort":%d},"res":{"statusCode":%d},"responseTime":%d,"msg":"%s"}\n' \
          "$level" "$ts" "$PID" "$HOSTNAME" "$req_id" "$method" "$url" "$REQ_HOSTNAME" "$remote_addr" "$remote_port" "$status_code" "$response_time" "$msg"
      fi
    else
      # --- Application log (no request context) ---
      case $level in
        10) msg=$(pick "${APP_MESSAGES_TRACE[@]}") ;;
        20) msg=$(pick "${APP_MESSAGES_DEBUG[@]}") ;;
        30) msg=$(pick "${APP_MESSAGES_INFO[@]}") ;;
        40) msg=$(pick "${APP_MESSAGES_WARN[@]}") ;;
        50)
          err_msg=$(pick "${ERROR_MESSAGES[@]}")
          stack=$(pick "${STACK_TRACES[@]}")
          printf '{"level":50,"time":%s,"pid":%d,"hostname":"%s","err":{"type":"Error","message":"%s","stack":"%s"},"msg":"%s"}\n' \
            "$ts" "$PID" "$HOSTNAME" "$err_msg" "$stack" "$err_msg"
          sleep "$INTERVAL"
          continue
          ;;
        60)
          msg=$(pick "${FATAL_MESSAGES[@]}")
          printf '{"level":60,"time":%s,"pid":%d,"hostname":"%s","msg":"%s"}\n' \
            "$ts" "$PID" "$HOSTNAME" "$msg"
          sleep "$INTERVAL"
          continue
          ;;
      esac

      printf '{"level":%d,"time":%s,"pid":%d,"hostname":"%s","msg":"%s"}\n' \
        "$level" "$ts" "$PID" "$HOSTNAME" "$msg"
    fi

    sleep "$INTERVAL"
  done
}

generate_logs | node ./packages/pinorama-transport/dist/cli.mjs --url "$URL"
