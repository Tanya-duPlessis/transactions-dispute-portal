# Resolve — Transaction Dispute Portal

> A production-grade full-stack web application that allows banking customers to view transactions and raise disputes, with a complete admin portal for managing the dispute resolution lifecycle.

[![CI](https://github.com/Tanya-duPlessis/transactions-dispute-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/Tanya-duPlessis/transactions-dispute-portal/actions/workflows/ci.yml)

---

## Live Demo

**Frontend:** https://zesty-truth-production-6150.up.railway.app

**API Docs (Swagger):** https://transactions-dispute-portal-production.up.railway.app/api/v1/docs

**API Health:** https://transactions-dispute-portal-production.up.railway.app/api/v1/health

---

## Quick Start

The entire stack runs with a single command. No manual setup required.

```bash
git clone https://github.com/Tanya-duPlessis/transactions-dispute-portal.git
cd transactions-dispute-portal
cp backend/.env.example backend/.env
docker-compose up
```

The app will be available at **http://localhost:3000**

Migrations run and the database seeds automatically on first startup.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Customer | customer1@demo.com | password123 |
| Customer | customer2@demo.com | password123 |
| Customer | customer3@demo.com | password123 |
| Admin | admin@demo.com | password123 |

All 9 customer accounts use `password123`. Customer emails follow the pattern `customer1@demo.com` through `customer9@demo.com`.

---

## Reviewer Walkthrough

### Customer Flow

1. Open the live URL or `http://localhost:3000`
2. Click **Customer 1** demo chip to auto-fill credentials → **Sign in**
3. You land on the **Transactions** page — 42 transactions pre-loaded with varied merchants, categories and dates
4. Use the **search bar** to find a merchant (e.g. "Checkers") or a reference number (e.g. "TXN-00100000")
5. Use the **category filter** to narrow results
6. Use the **date range filter** to filter by period
7. Click any transaction row to open the **Transaction Drawer** — shows full details including reference number
8. On an undisputed transaction, click **Raise a dispute** in the drawer or the **Dispute** button on the row
9. Select a reason, write a description, click **Next**, review the confirmation step, click **Submit dispute**
10. The transaction row now shows a status chip — click it or click **View dispute** to see the dispute detail
11. The **Dispute Detail** page shows the transaction summary, dispute reason, and a visual **audit timeline**
12. Click **My Disputes** in the nav to see all your disputes with status filters
13. Click **Dark mode** in the top-right to toggle the theme
14. Click the user avatar → **Sign out**

### Admin Flow

1. Log in as `admin@demo.com` / `password123`
2. You land on the **All Disputes** dashboard — all disputes across all customers
3. Use the **status filter chips** (Pending, Under review, Resolved, Rejected) to filter
4. Use the **search bar** to search by customer name, merchant or transaction reference
5. Click any dispute row to open the **Dispute Detail (Admin view)**
6. The admin sees the full audit timeline plus a **status update form**
7. Select the next valid status (e.g. Pending → Under review), add a note, click **Update status**
8. The timeline updates immediately with your action, timestamp and note
9. To **re-open** a resolved or rejected dispute, select **Pending** from the status dropdown

### API Flow (Swagger)

1. Open the Swagger URL above
2. Click **Authorize** → paste a JWT from a login response
3. All endpoints are documented and testable directly in the browser
4. Alternatively, import `postman_collection.json` into Postman

---

## Features

**Customer**
- [x] Login and registration with validation and password strength indicator
- [x] Transaction list with server-side pagination, search by merchant or reference, category filter, date range filter
- [x] Transaction drawer — click any row to see full details including reference number
- [x] Raise a dispute with a two-step confirmation flow
- [x] Dispute history with status filter
- [x] Dispute detail with full audit timeline showing every status change
- [x] View dispute status and history directly from the transactions list
- [x] Light and dark mode toggle (persisted to localStorage)

**Admin**
- [x] All disputes dashboard across all customers
- [x] Status filter chips (Pending, Under review, Resolved, Rejected)
- [x] Server-side search by customer name, merchant or reference number
- [x] Dispute detail with admin status update form
- [x] Dynamic note labels based on action (Resolution note, Rejection reason, Reason for re-opening)
- [x] Re-open resolved or rejected disputes with a note
- [x] Full audit trail showing every actor, timestamp and note

**Technical**
- [x] JWT authentication (access token + httpOnly refresh cookie)
- [x] Role-based access control (CUSTOMER / ADMIN)
- [x] Dispute state machine with valid transition guards
- [x] ACID transactions on dispute creation and status updates (prisma.$transaction)
- [x] Server-side pagination and filtering on all list endpoints
- [x] Simulated email notifications on dispute creation and status change
- [x] Swagger/OpenAPI documentation
- [x] Structured JSON logging with Winston
- [x] Rate limiting, Helmet, CORS, UUID validation
- [x] Multi-stage Docker builds with non-root users
- [x] GitHub Actions CI (lint, unit tests, integration tests, build)
- [x] Kubernetes manifests for production deployment
- [x] Live deployment on Railway

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                          │
│                React 18 + TypeScript + MUI v5                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express API (Node.js)                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Controllers │→ │   Services   │→ │    Repositories      │  │
│  │  (HTTP only) │  │ (Business    │  │  (DB access only)    │  │
│  └──────────────┘  │  logic)      │  └──────────┬───────────┘  │
│                    └──────────────┘             │ Prisma ORM   │
│  Middleware stack:                              ▼              │
│  Helmet → CORS → RateLimit → Auth → Validate   PostgreSQL     │
└─────────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    Docker Compose     GitHub Actions      Railway (live)
    (local dev)        (CI/CD)            (production)
```

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────────┐       ┌──────────────────┐
│    User     │       │     Transaction      │       │     Dispute      │
│─────────────│       │─────────────────────│       │──────────────────│
│ id (PK)     │──┐    │ id (PK)             │──┐    │ id (PK)          │──┐
│ email       │  │    │ userId (FK)    ──────┘  │    │ transactionId(FK)│  │
│ name        │  └───▶│ reference (unique)  │   └───▶│ userId (FK)      │  │
│ passwordHash│       │ amount              │        │ reason           │  │
│ role        │       │ merchant            │        │ description      │  │
│ createdAt   │       │ category            │        │ status           │  │
└─────────────┘       │ date                │        │ createdAt        │  │
                      │ description         │        │ updatedAt        │  │
                      │ createdAt           │        └──────────────────┘  │
                      └─────────────────────┘                              │
                                                                           │
                      ┌─────────────────────┐                             │
                      │    DisputeEvent     │                             │
                      │─────────────────────│                             │
                      │ id (PK)             │                             │
                      │ disputeId (FK) ─────────────────────────────────▶│
                      │ fromStatus          │
                      │ toStatus            │
                      │ note                │
                      │ actorId (FK → User) │
                      │ createdAt           │
                      └─────────────────────┘
```

**Indexes:**
- `Transaction(userId, date)` — composite, covers paginated transaction list sorted by date
- `Transaction(reference)` — covers reference number search
- `Dispute(userId, status)` — composite, covers filtered dispute history
- `DisputeEvent(disputeId)` — covers audit trail lookups
- `Dispute(transactionId)` — unique constraint, one dispute per transaction at DB level

---

## Dispute State Machine

```
                    [Customer submits]
                           │
                           ▼
                       PENDING
                           │
                  [Admin moves to review]
                           │
                           ▼
                      UNDER_REVIEW
                      │          │
          [Admin resolves]    [Admin rejects]
                      │          │
                      ▼          ▼
                  RESOLVED    REJECTED
                      │          │
              [Admin re-opens]   │
                      └──────────┘
                           │
                           ▼
                       PENDING

Invalid transitions are rejected with INVALID_TRANSITION error.
Every transition creates a DisputeEvent record (ACID transaction).
```

---

## Sequence Diagrams

### Dispute Creation Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant FE as Frontend
    participant API as Express API
    participant DB as PostgreSQL
    participant N as Notification

    C->>FE: Clicks "Raise dispute" on transaction
    FE->>FE: Opens dispute modal (step 1: details)
    C->>FE: Fills reason + description, clicks Next
    FE->>FE: Shows confirmation step
    C->>FE: Confirms submission
    FE->>API: POST /api/v1/transactions/:id/disputes
    API->>API: Validate JWT + Zod schema
    API->>DB: Check transaction exists and belongs to user
    API->>DB: Check no existing dispute for transaction
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT Dispute (status: PENDING)
    API->>DB: INSERT DisputeEvent (PENDING → PENDING, actor: customer)
    API->>DB: COMMIT
    API->>N: sendDisputeConfirmationEmail() [async, non-blocking]
    API->>FE: 201 Created { id, status: PENDING }
    FE->>FE: Close modal, refresh transaction list
    FE->>C: Toast: "Dispute submitted successfully"
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Express API
    participant DB as PostgreSQL

    C->>API: POST /api/v1/auth/login { email, password }
    API->>DB: SELECT user WHERE email = ?
    API->>API: bcrypt.compare(password, hash)
    API->>API: jwt.sign(payload, ACCESS_SECRET, 15m)
    API->>API: jwt.sign(payload, REFRESH_SECRET, 7d)
    API->>C: { accessToken } + Set-Cookie: refreshToken (httpOnly)

    Note over C,API: Later — access token expires

    C->>API: POST /api/v1/auth/refresh (cookie sent automatically)
    API->>API: jwt.verify(refreshToken, REFRESH_SECRET)
    API->>DB: Verify user still exists
    API->>API: Generate new token pair
    API->>C: { accessToken } + new refreshToken cookie

    Note over C,API: Axios interceptor handles this transparently
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Industry standard, strict typing, fast DX |
| UI Library | Material UI v5 | Enterprise-grade, professional banking feel |
| Theming | Custom MUI theme | Fintech colour palette — not generic MUI blue |
| Backend | Node.js + Express + TypeScript | Widely used, clean layered architecture |
| ORM | Prisma | Type-safe queries, easy migrations, great DX |
| Database | PostgreSQL | Relational with ACID support — critical for financial data |
| Auth | JWT + httpOnly cookie | Access token in memory, refresh token in httpOnly cookie for XSS protection |
| Validation | Zod | Runtime schema validation on all inputs |
| Logging | Winston | Structured JSON logging with log levels |
| API Docs | Swagger UI + swagger-jsdoc | Auto-generated interactive documentation |
| Testing | Jest + Supertest + RTL | Unit and integration tests |
| Containerisation | Docker + docker-compose | Multi-stage builds, non-root users |
| CI/CD | GitHub Actions | Lint → Test → Build pipeline |
| Deployment | Railway | Live demo with managed PostgreSQL |
| K8s | Kubernetes manifests | Production deployment patterns |

---

## Design Decisions and Trade-offs

**Repository pattern over direct Prisma calls in services**
All database access is isolated in repository classes. This makes services testable with mocked repositories (no test database needed for unit tests) and means the database layer can be swapped without touching business logic. Trade-off: more files and indirection for simple queries.

**JWT in memory + refresh token in httpOnly cookie**
The access token is stored in Zustand (memory) and the refresh token in an httpOnly cookie. This prevents XSS attacks from reading the refresh token while still allowing seamless token renewal. Trade-off: the access token is lost on page refresh, which the Axios interceptor handles by silently refreshing.

**Server-side pagination over client-side**
All pagination happens on the backend with SQL LIMIT/OFFSET. This means only the current page of data is ever sent to the client. For a banking portal with potentially thousands of transactions, client-side pagination would load all records at once — unacceptable. Trade-off: every page change is a network request.

**ACID transactions for dispute creation and status updates**
Creating a dispute atomically inserts both the `Dispute` row and the initial `DisputeEvent` row. If either fails, both are rolled back. This ensures the audit trail is always consistent with the dispute state — critical for a financial system. Trade-off: slightly slower writes.

**Prisma over raw SQL**
Prisma provides type safety, prevents SQL injection by default, and makes migrations manageable. Trade-off: for complex reporting queries with many joins and aggregations, raw SQL would perform better. In production, I would use raw SQL for analytics queries while keeping Prisma for CRUD operations.

**Railway for deployment over AWS**
For this submission, Railway was chosen to get a live URL quickly without the complexity of AWS IAM, VPC and ECS setup. Kubernetes manifests are included in `k8s/` to demonstrate that production deployment would use containerised workloads on a cluster. In a Capitec context, this would be deployed to AWS EKS with RDS PostgreSQL.

---

## Security Approach

| Concern | Implementation |
|---|---|
| Authentication | JWT with 15-minute access tokens and 7-day httpOnly refresh tokens |
| Password storage | bcrypt with 12 salt rounds |
| Input validation | Zod schemas on every request body and query string |
| SQL injection | Prisma parameterised queries — no raw string interpolation |
| XSS | httpOnly cookies for refresh tokens; CSP via Helmet |
| HTTP headers | Helmet middleware sets security headers on every response |
| Rate limiting | express-rate-limit on auth routes (20 requests per 15 minutes) |
| CORS | Restricted to the frontend origin only |
| Route parameters | UUID format validated before any database query |
| Sensitive data | Password hashes never returned in API responses |
| Reverse proxy | Express trust proxy enabled for accurate IP detection on Railway |

---

## Running Tests

```bash
cd backend

# Unit tests (no database required)
npm run test:unit

# Integration tests (requires PostgreSQL)
npm run test:integration

# All tests with coverage
npm run test:coverage
```

For integration tests locally, start the database first:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/disputes_db` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens | any long random string |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | any long random string (different from access) |
| `JWT_ACCESS_EXPIRY` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime | `7d` |
| `PORT` | Backend server port | `4000` |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `ETHEREAL_USER` | Simulated email user (optional) | auto-generated if blank |
| `ETHEREAL_PASS` | Simulated email password (optional) | auto-generated if blank |

---

## Kubernetes

See [`k8s/README.md`](k8s/README.md) for instructions on deploying to a Kubernetes cluster.

The manifests deploy:
- PostgreSQL as a StatefulSet with a PersistentVolumeClaim
- Backend as a Deployment with readiness and liveness probes
- Frontend as a Deployment (2 replicas) behind a LoadBalancer Service

Secrets are managed via `kubectl create secret` and never committed to the repository.

---

## Known Limitations and Future Improvements

- **Email notifications are simulated** — Nodemailer sends to Ethereal (a fake SMTP server). In production this would integrate with the bank's email infrastructure or a service like AWS SES.
- **No document upload** — A real dispute portal would allow customers to attach evidence (receipts, screenshots). This would require file storage (S3) and virus scanning.
- **Single admin role** — In production there would be multiple admin roles (reviewer, approver, fraud analyst) with different permissions and escalation paths.
- **No audit log for admin actions** — Admin logins and actions are not separately audited. In a banking context this would be required for compliance.
- **Frontend tests** — Component-level tests with React Testing Library are scaffolded but not fully implemented. The backend has full unit and integration test coverage.
- **Kubernetes not tested end-to-end** — The manifests follow production patterns but have not been applied to a live cluster for this submission.
