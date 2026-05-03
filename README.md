# HookFlow – Scalable Webhook Delivery System

HookFlow is a production-ready, high-performance webhook delivery engine built with Node.js, MongoDB, and Redis. It handles millions of events with parallel delivery, exponential backoff retries, and secure HMAC signing.

## 🚀 Features

- **Parallel Delivery**: High-throughput webhook fan-out using `Promise.all`.
- **Reliability**: Exponential backoff (5 attempts) with BullMQ.
- **Security**: SHA256 HMAC signatures for each delivery.
- **Idempotency**: Prevents duplicate event processing via `x-idempotency-key`.
- **DLQ**: Dead Letter Queue for tracking and re-processing permanent failures.
- **Observability**: Centralized Winston logging and `/metrics` API.
- **Production Ready**: Configured for Render, MongoDB Atlas, and Upstash.

## 🏗 Architecture

HookFlow uses a **Producer-Consumer** architecture:
1. **API (Producer)**: Receives events and queues them in Redis.
2. **Worker (Consumer)**: Picks up jobs, fetches subscribers, signs payloads, and delivers them in parallel.
3. **Storage**: MongoDB stores event logs, subscription metadata, and event history.

## 🛠 Tech Stack

- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **Queue/Cache**: Redis (BullMQ)
- **Logging**: Winston
- **HTTP Client**: Axios (with 5s timeouts)

## 🚦 API Endpoints

### Subscribers
- `POST /api/subscribers`: Register a new webhook listener.
  - Body: `{ "url": "https://callback.com", "eventType": "user.created" }`

### Events
- `POST /api/events`: Trigger a new event.
  - Headers: `x-idempotency-key: unique-uuid`
  - Body: `{ "eventType": "user.created", "payload": { "id": 123 } }`
- `GET /api/events/:eventId`: Track delivery status per subscriber.

### Monitoring
- `GET /api/metrics`: Real-time system health and success rates.
- `GET /api/dlq`: View failed deliveries in the Dead Letter Queue.

## 📦 Setup Instructions

1. **Clone & Install**:
   ```bash
   git clone https://github.com/ekanshmishra-dev/hookflow.git
   cd hookflow
   npm install
   ```
2. **Environment Configuration**:
   - Copy `.env.example` to `.env`.
   - Update `MONGODB_URI` and `REDIS_URL` credentials.
3. **Execution**:
   - Start API Server: `npm start`
   - Start Background Worker: `npm run worker`

### 🐳 Docker (Optional)
```bash
docker-compose up -d
```

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## 🔐 HMAC Verification (Example)

Subscribers can verify authenticity using the `x-webhook-signature` header:
```javascript
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', SECRET).update(JSON.stringify(payload)).digest('hex');
const isValid = (hmac === receivedSignature);
```

---
Built for scale and reliability.
