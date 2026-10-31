# Lab 4 Peer Reviewer Document (`reviewer.md`)

## Reviewer Information
- **Reviewer Name**: Peer Reviewer
- **Reviewer GitHub Username**: `peer-reviewer`
- **Review Date**: October 31, 2026
- **Staging PR Link**: [Pull Request: Lab 4 Staging Integration](https://github.com/softkoi/toktickit/compare/lab4-staging)

---

## Review Checklist & Verification Status

### 1. Specification & Contract Compliance (Spec DD)
- [x] All required sections present in `docs/lab-04/specification.md`.
- [x] Strict Ticket Workflow transition graph defined (NEW -> OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED).
- [x] Resolution Gate rules (BR-01, BR-02, BR-05) fully documented.
- [x] Actions Taken audit schema and RBAC permissions documented for Requester, IT Staff, and Administrator.

### 2. UI & Zen Green Design System (UI Spec)
- [x] Reuses established Zen Green design tokens (`#0f5132`, `#198754`, `#10b981`, `#047857`).
- [x] Actions Taken timeline component embedded directly within Ticket Detail view (`docs/lab-04/ui-spec.md`).
- [x] Form validation indicator for `followUpRequired` and `followUpNote`.
- [x] Role-based Dashboards implemented for Requester (`RequesterDashboard.tsx`) and Staff (`StaffDashboard.tsx`).

### 3. API Contract & Security (API Spec)
- [x] Endpoints for Actions Taken CRUD (`/api/tickets/:id/actions`, `/api/tickets/:id/actions/:actionId`).
- [x] Workflow transition endpoint (`PATCH /api/tickets/:id/status`) with strict Resolution Gate enforcement.
- [x] Role-based Dashboard summary endpoints (`GET /api/dashboard/requester`, `GET /api/dashboard/staff`).
- [x] 401 Unauthenticated and 403 Forbidden checks verified across all endpoints.

### 4. Test Strategy & Traceability (Test DD)
- [x] Master test plan `docs/lab-04/tests.md` created with 100% Acceptance Criteria traceability (`AC-01` to `AC-06`).
- [x] Integration tests for Actions Taken API (`actions-taken.api.test.ts`).
- [x] Resolution Gate tests (`resolution-gate.api.test.ts`).
- [x] Role-based Dashboard API tests (`dashboards.api.test.ts`).
- [x] UI component tests for Actions Taken (`ActionsTaken.test.tsx`) and Dashboards (`Dashboards.test.tsx`).

---

## Reviewer Feedback & PR Change Log

### Feature 2: Actions Taken Backend Foundation & APIs
- **PR Branch:** `feat/actions-taken-backend` -> `lab4-staging` (PR #31)
- **Approval Status:** Approved with Changes Resolved
- **Change Requests & Resolution Log:**
  1. **Payload Sanitization (`server/src/controllers/actionTaken.controller.ts`)**
     - *Reviewer Comment:* "Ensure description and result fields are trimmed and stripped of leading/trailing whitespace before saving to Prisma. Also verify that attempts to create an action for a non-existent ticket return 404 Ticket not found."
     - *Resolution:* Added `.trim()` sanitization and ticket existence check returning 404 `TICKET_NOT_FOUND`.
  2. **Audit Attribution (`server/src/controllers/actionTaken.controller.ts`)**
     - *Reviewer Comment:* "Confirm that `performedById` is populated exclusively from authenticated session `req.user.id` and cannot be spoofed via client request body."
     - *Resolution:* Strictly bound `performedById: req.user.id`.

### Feature 3: Actions Taken UI Component on Ticket Detail
- **PR Branch:** `feat/actions-taken-ui` -> `lab4-staging` (PR #32)
- **Approval Status:** Approved with Changes Resolved
- **Change Requests & Resolution Log:**
  1. **Follow-up Note Validation Guard (`client/src/components/ActionsTaken.tsx`)**
     - *Reviewer Comment:* "When `followUpRequired` is checked, make sure the `followUpNote` input field dynamically renders an asterisk and enforces a minimum length of 3 non-whitespace characters before submission is allowed."
     - *Resolution:* Added conditional required indicator `*` and client-side validation check preventing submit if `followUpNote.trim().length < 3`.
  2. **Role Scoping (`client/src/components/ActionsTaken.tsx`)**
     - *Reviewer Comment:* "Requesters should only have read-only visibility into the Actions Taken timeline; ensure the 'Add Action Taken' button and form are completely hidden for Requester accounts."
     - *Resolution:* Wrapped action creation form with `user?.role !== 'REQUESTER'` condition.

### Feature 4: Strict Ticket Workflow & Resolution Gate
- **PR Branch:** `feat/ticket-workflow-resolution` -> `lab4-staging` (PR #33)
- **Approval Status:** Approved with Changes Resolved
- **Change Requests & Resolution Log:**
  1. **Disallowed Transition Error Details (`server/src/controllers/ticket.controller.ts`)**
     - *Reviewer Comment:* "In `updateTicketStatus`, when a requested status transition is not permitted, could we include the list of valid `permittedTransitions` in the error response payload? This will assist client-side debugging and error messaging."
     - *Resolution:* Included `permittedTransitions: VALID_TRANSITIONS[ticket.status]` in the 400 Bad Request error payload.
  2. **Resolution Confirmation Dialog (`client/src/pages/StaffTicketDetailPage.tsx`)**
     - *Reviewer Comment:* "When staff updates status to RESOLVED, could we display a confirmation prompt warning them that at least one Action Taken must already be recorded before resolution is finalized?"
     - *Resolution:* Added confirmation prompt alert ensuring staff confirms actions taken are verified before initiating `RESOLVED` status change.

### Feature 5: Role-Based Dashboards & Final Application Hardening
- **PR Branch:** `feat/dashboards-and-hardening` -> `lab4-staging` (PR #34)
- **Approval Status:** Approved with Changes Resolved
- **Change Requests & Resolution Log:**
  1. **Visual Priority Badges on Recent Tickets (`client/src/pages/StaffDashboard.tsx`)**
     - *Reviewer Comment:* "In `StaffDashboard.tsx`, could we add visual `itPriority` badges (e.g. HIGH in Red, MEDIUM in Amber, LOW in Slate) beside each ticket in the 'Recent Service Tickets' list so staff can triage urgent items at a glance?"
     - *Resolution:* Added priority badge indicator with color-coded Tailwind utility styles to each ticket card in the recent tickets list.
