# TokTickIT

TokTickIT is an IT Service Desk web application developed for **CPE334: Introduction to Software Engineering in the Age of AI Agents**.

The project is developed iteratively through multi-sprint laboratory milestones:
- **Lab 1:** Foundation vertical slice (React + Express REST API + Prisma ORM + PostgreSQL).
- **Lab 2:** Requester Ticketing MVP with complete ticket creation, dashboard filtering, attachment lifecycle management, and responsive design.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Multer (file upload)
- **Database:** PostgreSQL (Docker container / Prisma Postgres)
- **Testing:**
  - Unit & Integration: Vitest, React Testing Library, Supertest
  - End-to-End & Responsive: Playwright (Chromium)

---

## Repository Structure

```
toktickit/
├── client/                      # React Frontend with Tailwind CSS
│   ├── src/                     # Components, Pages, State Hooks
│   └── tests/                   # UI Component & Responsive tests
├── server/                      # Express + Prisma Backend
│   ├── prisma/                  # Schema models, migrations, seed script
│   ├── src/                     # Controllers, Services, Validation helpers
│   └── tests/                   # Unit & API Integration test suite
├── docs/
│   └── lab-02/                  # Lab 2 Specifications, Test plan, API & UI specs
└── package.json                 # Root scripts & configuration
```

---

## Getting Started

### 1) Prerequisites
- **Node.js** (v20+ recommended)
- **Docker & Docker Compose** (for PostgreSQL)

### 2) Database Setup
Start the local PostgreSQL container:
```bash
docker compose up -d
```

Configure `server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/toktickit?schema=public"
CLIENT_ORIGIN="http://localhost:5173"
```

Run database migrations and seed data:
```bash
cd server
npm install
npx prisma db push
npm run seed
cd ..
```

### 3) Install Dependencies & Run Applications

#### Client:
```bash
cd client
npm install
npm run dev
```
*Client runs at http://localhost:5173*

#### Server:
```bash
cd server
npm install
npm run dev
```
*Server runs at http://localhost:3000*

---

## Running Automated Tests

### 1) Backend Unit & Integration Tests (Supertest & Vitest)
```bash
cd server
npm test
```
*Executes all unit tests (`UNIT-01` to `UNIT-09`) and API integration tests (`API-01` to `API-27`).*

### 2) Frontend UI Component Tests (Vitest)
```bash
cd client
npm test
```
*Executes client rendering and interaction tests.*

### 3) End-to-End & Responsive Visual Tests (Playwright)
From the repository root:
```bash
npx playwright test
npx playwright show-report
```
*Verifies user lifecycle flows (`E2E-01` to `E2E-07`) and captures responsive layout screenshots.*

---

## Lab Deliverables & Documentation

### Lab 2:
- **Sprint 2 Specification** — Comprehensive business rules and acceptance criteria (`docs/lab-02/specification.md`)
- **REST API Specification** — Endpoint contracts, request/response formats, error codes (`docs/lab-02/api-spec.md`)
- **UI Specification** — Zen Green design system, layout rules, screenshot requirements (`docs/lab-02/ui-spec.md`)
- **Test Plan & Verification Records** — 48 automated test cases with 100% Pass status (`docs/lab-02/tests.md`)

---

## Lab 2 Acceptance Summary

- **Requester Context & Isolation:** Development requester selection simulating authenticated sessions; strict data isolation across requesters with 403 Forbidden protection.
- **Atomic Ticket Number Generation:** Format `TKT-YYYY-XXXXXX` with transaction-safe yearly rollover.
- **Support Ticket Dashboard:** Search by keyword/number, filter by category/priority/status, pagination, and deterministic secondary sorting (`ticketNumber DESC`).
- **Attachment Lifecycle Management:** Allowed types (JPG, PNG, WEBP, PDF ≤ 5 MB, max 5 active attachments), and audit-compliant soft-deletion requiring a reason.
- **Zen Green Design & Responsiveness:** Fully responsive interface across Desktop (1280px), Tablet (768px), and Mobile (375px) featuring a collapsible mobile hamburger drawer and zero horizontal overflow.
