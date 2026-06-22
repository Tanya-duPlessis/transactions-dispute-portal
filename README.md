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

### Option 1 — Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) or [Rancher Desktop](https://rancherdesktop.io/) to be running.

```bash
git clone https://github.com/Tanya-duPlessis/transactions-dispute-portal.git
cd transactions-dispute-portal
cp backend/.env.example backend/.env
docker-compose up
```

The app will be available at **http://localhost:3000**

Migrations run and the database seeds automatically on first startup.

### Option 2 — Run locally without Docker

Requires Node.js 22+ and PostgreSQL installed locally.

**Step 1 — Start PostgreSQL (skip if already running)**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb disputes_db
```

**Step 2 — Backend**
```bash
git clone https://github.com/Tanya-duPlessis/transactions-dispute-portal.git
cd transactions-dispute-portal/backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

**Step 3 — Frontend (new terminal)**
```bash
cd transactions-dispute-portal/frontend
npm install
npm run dev
```

The app will be available at **http://localhost:3000**

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

## Screenshots

### Customer — Login
![Login](screenshots/01-login.png)

### Customer — Transactions
![Transactions](screenshots/03-transactions-list.png)

### Customer — Transaction Drawer
![Transaction Drawer](screenshots/04-transaction-drawer.png)

### Customer — Raise a Dispute
![Dispute Modal](screenshots/08-dispute-modal-confirm.png)

### Customer — Dispute Submitted
![Dispute Submitted](screenshots/09-dispute-submitted-success.png)

### Customer — Dispute Detail with Timeline
![Dispute Detail](screenshots/11-dispute-detail-customer.png)

### Customer — My Disputes
![My Disputes](screenshots/12-my-disputes-list.png)

### Dark Mode
![Dark Mode](screenshots/14-transactions-dark-mode.png)

### Admin — All Disputes Dashboard
![Admin Dashboard](screenshots/18-admin-disputes-dashboard.png)

### Admin — Dispute Detail with Status Update
![Admin Dispute Detail](screenshots/21-admin-dispute-updated.png)

### Admin — Full Audit Timeline (Resolved)
![Resolved Timeline](screenshots/26-dispute-detail-seeded-resolved.png)

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

![System Architecture](diagrams/system-architecture.png)

---

## Entity Relationship Diagram

![ERD](diagrams/erd.png)

**Indexes:**
- `Transaction(userId, date)` — composite, covers paginated transaction list sorted by date
- `Transaction(reference)` — covers reference number search
- `Dispute(userId, status)` — composite, covers filtered dispute history
- `DisputeEvent(disputeId)` — covers audit trail lookups
- `Dispute(transactionId)` — unique constraint, one dispute per transaction at DB level

---

## Dispute State Machine

![Dispute State Machine](diagrams/dispute-state-machine.drawio.png)

Invalid transitions are rejected with an `INVALID_TRANSITION` error.
Every transition creates a `DisputeEvent` record in an ACID transaction.

---

## Sequence Diagrams

### Dispute Creation Flow

![Dispute Creation Flow](diagrams/dispute-creation-flow.png)

### Authentication Flow

![Authentication Flow](diagrams/auth-flow.png)

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

**Repository pattern**
I separated all DB access into repository classes so the service layer has no idea how data is fetched. It made unit testing much cleaner — I can mock the repository and test business logic without spinning up a database. It also means if we ever moved away from Prisma, the services wouldn't need to change. Yes, it adds more files, but the separation is worth it.

**JWT access token in memory, refresh token in httpOnly cookie**
Storing the access token in localStorage is a common XSS risk. I keep it in Zustand (memory only) so it dies on page refresh, and the refresh token lives in an httpOnly cookie that JavaScript can't touch. The Axios interceptor quietly refreshes the access token when it expires, so the user never notices. It's a bit more setup but the security trade-off is non-negotiable for a financial app.

**Server-side pagination**
Pagination happens on the backend — the API only ever returns the current page. I could have loaded everything client-side and filtered in the browser, but that falls apart the moment you have real volume. For transactions especially, it had to be server-side from the start.

**ACID transactions on dispute creation and status changes**
Every dispute action does two writes — update the dispute and insert an audit event. I wrapped both in `prisma.$transaction()` so they either both succeed or both fail. Without that, a crash between the two writes would leave the audit trail out of sync with the actual status. Not acceptable in a financial context.

**Prisma over raw SQL**
Prisma gives me type-safe queries and handles migrations cleanly, which made development much faster. The one place I'd reach for raw SQL in production is complex reporting — aggregations across large datasets where the query planner needs more control. For everything in this project, Prisma was the right call.

**Railway over AWS for the live demo**
I chose Railway because it got me a live URL in minutes and let me focus on the code rather than cloud infrastructure setup. The Kubernetes manifests in `k8s/` show how this would be deployed in a production environment — in a Capitec context that would be AWS EKS with RDS PostgreSQL.

---

## Security Approach

Security wasn't an afterthought — it's built into every layer.

| Concern | What I did |
|---|---|
| Passwords | bcrypt with 12 salt rounds — slow by design |
| Tokens | Short-lived access tokens (15min) + httpOnly refresh cookie (7 days) |
| Input | Zod validates every request body and query param before it touches the DB |
| SQL injection | Prisma uses parameterised queries throughout — no string interpolation |
| HTTP headers | Helmet sets CSP, HSTS and other security headers on every response |
| Rate limiting | Auth routes are limited to 20 requests per 15 minutes |
| CORS | Only the frontend origin is allowed — no wildcard |
| Route params | UUIDs are validated before any DB query hits — no malformed IDs reach Prisma |
| Responses | Password hashes are never included in any API response |
| Reverse proxy | Trust proxy is enabled so rate limiting works correctly behind Railway's load balancer |

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

## Known Limitations and What I'd Add Next

**Email notifications are simulated.** Right now Nodemailer sends to Ethereal — a fake inbox that captures emails without delivering them. In production this would connect to the bank's existing email infrastructure or AWS SES. The notification service is already abstracted, so swapping it out would be a one-file change.

**No document uploads.** A real dispute process lets customers attach evidence — receipts, screenshots, bank statements. I'd add this with S3 for storage and a virus scan step before accepting any file.

**One admin role.** The current system has a single ADMIN role that can do everything. In practice you'd want separate roles — an agent who can move disputes to review, a senior who can resolve or reject, and a fraud team with escalation access. The role system is already in place, it just needs more granular permissions.

**Frontend component tests.** I wrote full backend unit and integration test coverage but didn't complete the frontend component tests. The test setup with Vitest and React Testing Library is in place — login, transaction list, and dispute form tests are next on the list.

**Kubernetes manifests aren't battle-tested.** The `k8s/` files follow production patterns and would work on a real cluster, but I haven't applied them to a live environment for this submission. That was a deliberate time trade-off — I prioritised the working live demo over a Kubernetes setup that couldn't be verified end-to-end.
