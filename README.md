# TokTickIT

TokTickIT is an IT Service Desk web application developed for **CPE334: Introduction to Software Engineering in the Age of AI Agents**.

The project is developed iteratively through multi-sprint laboratory milestones:
- **Lab 1:** Foundation vertical slice (React + Express REST API + Prisma ORM + PostgreSQL).
- **Lab 2:** Requester Ticketing MVP with complete ticket creation, dashboard filtering, attachment lifecycle management, and responsive design.
- **Lab 3:** Enterprise-grade Authentication, Role-Based Access Control (RBAC), IT Staff Queue & Operations, Public Comments & Internal Notes, and Administrator User Management.
- **Lab 4:** Actions Taken Tracking, Strict Ticket Workflow & Resolution Gate, Role-Based Dashboards (Requester, IT Staff, Admin), and Final Full-Stack Application Hardening.

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
│   ├── src/                     # Components, Pages, Auth Context
│   └── tests/                   # UI Component & Responsive tests
├── server/                      # Express + Prisma Backend
│   ├── prisma/                  # Schema models, migrations, seed script
│   ├── src/                     # Controllers, Services, RBAC Middlewares
│   └── tests/                   # Unit & API Integration test suite
├── docs/
│   ├── lab-02/                  # Lab 2 Specifications, Test plan, API & UI specs
│   ├── lab-03/                  # Lab 3 Specifications, Test plan, Reviewer & AI logs
│   └── lab-04/                  # Lab 4 Specifications, Test plan, Reviewer & AI logs
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
*Executes all unit tests and RBAC API integration tests.*

### 2) Frontend UI Component Tests (Vitest)
```bash
cd client
npm test
```
*Executes client rendering, RBAC context, and interaction tests.*

### 3) End-to-End & Responsive Visual Tests (Playwright)
From the repository root:
```bash
npx playwright test
npx playwright show-report
```
*Verifies multi-role user workflows and captures responsive layout screenshots.*

---

## Lab Deliverables & Documentation

### Lab 4:
- **Sprint 4 Engineering Specification** — Actions Taken schema, Strict Ticket Workflow & State Transitions, Resolution Gate (BR-01 to BR-05), and Role-Based Dashboards (`docs/lab-04/specification.md`)
- **REST API Specification** — Actions Taken CRUD, status transition gates, and requester/staff dashboard metrics endpoints (`docs/lab-04/api-spec.md`)
- **UI Specification** — Actions Taken timeline component, dynamic follow-up validation, and Role-Based Dashboards (`docs/lab-04/ui-spec.md`)
- **Master Test Plan & Traceability** — 100% Acceptance Criteria traceability matrix covering 5 automated test layers (`docs/lab-04/tests.md`)
- **Peer Reviewer Record** — PR review comments, change requests, and resolution logs (`docs/lab-04/reviewer.md`)
- **AI-Use Record** — Prompt engineering log and development reflections (`docs/lab-04/ai-use.md`)

### Lab 3:
- **Sprint 3 Specification** — Role-Based Authorization, IT Staff Queue & Operational Workflow, Admin User Management (`docs/lab-03/specification.md`)
- **REST API Specification** — Authentication cookies, IT Queue & Comment/Note endpoints (`docs/lab-03/api-spec.md`)
- **UI Specification** — Public comments, private internal notes, IT queue data table & mobile cards (`docs/lab-03/ui-spec.md`)
- **Test Plan & Traceability** — 100% Acceptance Criteria traceability matrix (`docs/lab-03/tests.md`)
- **Peer Reviewer Record** — Code review feedback & PR resolution log (`docs/lab-03/reviewer.md`)
- **AI-Use Record** — Prompt engineering log & reflection (`docs/lab-03/ai-use.md`)
- **Migration Strategy** — Database schema migration from Lab 2 to Lab 3 (`docs/lab-03/migration-strategy.md`)

### Lab 2:
- **Sprint 2 Specification** — Comprehensive business rules and acceptance criteria (`docs/lab-02/specification.md`)
- **REST API Specification** — Endpoint contracts, request/response formats, error codes (`docs/lab-02/api-spec.md`)
- **UI Specification** — Zen Green design system, layout rules, screenshot requirements (`docs/lab-02/ui-spec.md`)
- **Test Plan & Verification Records** — 48 automated test cases with 100% Pass status (`docs/lab-02/tests.md`)

---

## Lab 4 Acceptance Summary

- **Actions Taken Tracking:** Parent-child relation under Ticket recording Action Date/Time, Description, Result, automated Performed By attribution, Follow-Up Required toggle with mandatory note validation, and attachment references.
- **Strict Ticket Workflow & Resolution Gate:** Formal state machine enforcement (`NEW` -> `OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`), Requester advisory resolution state without direct status mutation, Resolution Gate blocking `RESOLVED` without at least one recorded Action Taken (`BR-01`), and optimistic concurrency protection against stale overwrites (`409 Conflict`).
- **Role-Based Dashboards:** Isolated operational summary endpoints and responsive dashboards for Requesters (open/waiting ticket cards, recent submissions, quick logging) and IT Staff/Admins (5-column queue metrics, priority badges, recent service tickets with drill-downs, and system user counts).
- **Application Hardening & Zen Green Polish:** Comprehensive regression test suite across Labs 1-4, responsive drawer layout, error boundaries, accessible color-coded priority badges, and robust error state fallbacks.

---

## Lab 3 Acceptance Summary

- **Authentication & RBAC:** Secure HTTP-only cookies, bcrypt password hashing, mandatory initial password change, and server-side 401/403 authorization across Requesters, IT Staff, and Administrators.
- **IT Staff Queue & Operations:** Dedicated queue with search, status/priority filtering, ticket claiming/reassignment, and IT priority management.
- **Comments & Internal Notes:** Public comments for Requester-IT Staff communication, and restricted internal notes with amber warning indicators for IT Staff/Admin audit trailing.
- **Administrator User Management:** Searchable user table, single-role assignment (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), initial password reset, self-deactivation guard, and last-active admin protection constraint.

