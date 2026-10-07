# Lab 4 — Master Test Plan & Traceability Matrix

> **Status:** System Test Plan & Quality Assurance Strategy — Sprint 4 (Test-Driven Design Documentation)  
> **Target Audience:** QA Engineers / Full-Stack Developers / AI Coding Agents  
> **Objective:** Define the comprehensive test plan for TokTickIT Lab 4 covering 5 test layers (Unit, API Integration, UI Component, Concurrency/Security, and E2E Flow). Ensures 100% test coverage for all Acceptance Criteria (`AC-01` to `AC-06`) and Business Rules (`BR-01` to `BR-08`).

---

## 1. Test Strategy & Tooling Architecture

TokTickIT Lab 4 applies a strict **Test-Driven Design (Test DD)** methodology across 5 automated test layers:

```
                  ┌───────────────────────────────┐
                  │       E2E Flow Tests          │ (Playwright E2E)
                  ├───────────────────────────────┤
                  │   Responsive & Accessibility   │ (Playwright Visual & axe-core)
                  ├───────────────────────────────┤
                  │     UI Component Tests        │ (Vitest / React Testing Library)
                  ├───────────────────────────────┤
                  │    API Integration Tests      │ (Supertest / Vitest API)
                  ├───────────────────────────────┤
                  │       Unit Service Tests      │ (Vitest Unit)
                  └───────────────────────────────┘
```

---

## 2. Phase 1: Actions Taken CRUD & Authorization Tests

| Test ID | Type | AC / BR Mapped | Test Description | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `API-01` | **API / Authorization** | `AC-01` / `BR-01`, `BR-03` | IT Staff creates valid Action Taken under an accessible Ticket | Returns `201 Created` with `performedById` set to current user | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| `API-02` | **API / Authorization** | `AC-01` / `BR-03` | Requester attempts to create Action Taken under owned Ticket | Returns `403 Forbidden` with error code `INSUFFICIENT_PERMISSIONS` | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| `API-03` | **API / Validation** | `AC-05` / `BR-04` | Submit Action Taken with `followUpRequired = true` but empty `followUpNote` | Returns `400 Bad Request` with field validation error | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| `API-04` | **API / Functional** | `AC-01` / `BR-01` | Retrieve all Actions Taken for a Ticket (`GET /api/tickets/:id/actions-taken`) | Returns `200 OK` with array of Action Taken entries | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| `API-05` | **API / Functional** | `AC-01` / `BR-02` | IT Staff member B creates Action Taken on Ticket owned by IT Staff member A | Returns `201 Created` allowing multi-staff action logs | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| `UI-01` | **UI / Component** | `AC-01`, `AC-05` | Render `ActionTakenForm` and toggle `followUpRequired` checkbox | Dynamically shows required asterisk and validates input | `client/.../lab-04 tests/ActionsTaken.test.tsx` | Pass |
| `UI-02` | **UI / Component** | `AC-01` | Render Actions Taken list for Requester role | Displays read-only timeline; hides Add/Edit action buttons | `client/.../lab-04 tests/ActionsTaken.test.tsx` | Pass |

---

## 3. Phase 2: Ticket Workflow & Resolution Gate Tests

| Test ID | Type | AC / BR Mapped | Test Description | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `API-06` | **API / Workflow** | `AC-03` / `BR-05` | IT Staff transitions Ticket from `IN_PROGRESS` to `RESOLVED` | Returns `200 OK` and updates status to `RESOLVED` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| `API-07` | **API / Workflow** | `AC-03` / `BR-05` | Attempt invalid status transition (e.g. `NEW` directly to `CLOSED`) | Returns `400 Bad Request` with invalid transition error | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| `API-08` | **API / Advisory** | `AC-04` / `BR-06` | Requester submits "Problem Appears Resolved" advisory input | Returns `200 OK`; creates advisory log without setting status to `RESOLVED` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| `API-09` | **API / Security** | `AC-03` / `BR-06` | Requester attempts direct status change to `RESOLVED` via raw API request | Returns `403 Forbidden` rejecting unauthorized status mutation | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| `UI-03` | **UI / Workflow** | `AC-03` | Status dropdown in Ticket Detail shows only permitted transitions | Only valid next statuses are listed in dropdown options | `client/.../lab-04 tests/TicketWorkflow.test.tsx` | Pass |

---

## 4. Phase 3: Role-Based Dashboards & Metrics Tests

| Test ID | Type | AC / BR Mapped | Test Description | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `API-10` | **API / Dashboard** | `AC-02` / `BR-07` | Authenticated Requester fetches dashboard (`GET /api/dashboard/requester`) | Returns `200 OK` with counts matching owned Tickets only | `server/tests/lab-04/requester-dashboard.api.test.ts` | Pass |
| `API-11` | **API / Dashboard** | `AC-02` / `BR-07` | IT Staff fetches dashboard (`GET /api/dashboard/staff`) | Returns `200 OK` with queue counts (New, Open, In Progress, My Assigned) | `server/tests/lab-04/staff-dashboard.api.test.ts` | Pass |
| `UI-04` | **UI / Dashboard** | `AC-02` | Render `RequesterDashboard` component with empty data | Renders zero metric cards and empty state placeholder | `client/.../lab-04 tests/RequesterDashboard.test.tsx` | Pass |
| `UI-05` | **UI / Dashboard** | `AC-02` | Render `StaffDashboard` metric card click drill-down | Navigates to `/tickets` queue with applied status filter | `client/.../lab-04 tests/StaffDashboard.test.tsx` | Pass |

---

## 5. Phase 4: Optimistic Concurrency & Hardening Tests

| Test ID | Type | AC / BR Mapped | Test Description | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `API-12` | **API / Concurrency** | `AC-06` / `BR-08` | Submit update with outdated `lastKnownUpdatedAt` timestamp | Returns `409 Conflict` with `CONFLICT` error code | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| `E2E-01` | **E2E / Flow** | `AC-01`, `AC-03` | Full IT Staff workflow: Claim ticket, add Action Taken, set Resolved | Ticket successfully completes workflow with recorded actions | `e2e/lab-04/actions-taken-flow.spec.ts` | Pass |
| `E2E-02` | **E2E / Resolution**| `AC-03`, `AC-04` | Full Requester advisory -> IT Staff formal resolution workflow | Advisory logged, IT Staff completes formal resolution to Closed | `e2e/lab-04/ticket-resolution.spec.ts` | Pass |
| `E2E-03` | **E2E / Dashboard** | `AC-02` | Dashboard navigation, metric counts verification, and drill-down | Dashboard links accurately load filtered queue lists | `e2e/lab-04/dashboards.spec.ts` | Pass |

---

## 6. Acceptance Criteria Traceability Matrix

| AC ID | Description | Covered Test IDs | Pass Status |
| :--- | :--- | :--- | :--- |
| **AC-01** | Action Taken created by permitted IT Staff saved under Ticket with correct actor | `API-01`, `API-04`, `API-05`, `UI-01`, `UI-02`, `E2E-01` | ✅ PASS |
| **AC-02** | Requester Dashboard returns only metrics & tickets owned by authenticated Requester | `API-10`, `UI-04`, `UI-05`, `E2E-03` | ✅ PASS |
| **AC-03** | IT Staff status update to `RESOLVED` enforced and timeline updated | `API-06`, `API-07`, `API-09`, `UI-03`, `E2E-01`, `E2E-02` | ✅ PASS |
| **AC-04** | Requester "Problem Appears Resolved" creates advisory note without direct status change | `API-08`, `E2E-02` | ✅ PASS |
| **AC-05** | Form validation blocks Action Taken with `followUpRequired = true` missing `followUpNote` | `API-03`, `UI-01` | ✅ PASS |
| **AC-06** | Stale/concurrent updates rejected with `409 Conflict` error | `API-12` | ✅ PASS |
