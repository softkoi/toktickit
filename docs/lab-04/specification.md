# Lab 4 Engineering Specification: TokTickIT Actions Taken, Dashboards, and Final Regression

## 1. Sprint Goal
Deliver a complete TokTickIT service-desk workflow for Sprint 4 by introducing Actions Taken for IT Staff, enforcing strict Ticket status transitions and formal resolution gates, providing role-appropriate dashboards for Requesters, IT Staff, and Administrators, and hardening the entire full-stack application built across Labs 1 to 3 under the Zen Green design system.

---

## 2. Stakeholder Request
"The service desk can now receive Tickets and IT Staff can communicate with Requesters, but we still need a reliable way to plan and track the actual work. Add Actions Taken under each Ticket. Each action should contain Action Date/Time, Action Description, Result, Performed by (auto), Follow-Up Required?, Follow-up Note (required when follow-up is needed), Attachment Notes (what file to look for images etc.).

The primary Ticket Owner remains responsible for coordinating the Ticket as a whole. Requesters may continue to indicate that the problem appears resolved, but IT Staff must review the work and formally update the Ticket.

Add useful dashboards for Requesters and IT Staff, but keep them concise and connected to the detailed screens. Finally, polish and harden the complete application so that all earlier features continue to work consistently under the Zen Green design language."

---

## 3. Scope

### 3.1 Included Work
1. **Actions Taken Data & Parent-Child Structure**:
   - One Ticket can contain multiple `ActionTaken` records (Parent-Child relationship).
   - Fields: Action Date/Time (`createdAt`), Action Description (`description`), Result (`result`), Performed by (`performedById`, auto-assigned to current IT Staff/Admin), Follow-Up Required (`followUpRequired`), Follow-up Note (`followUpNote`, required if follow-up required), Attachment Notes (`attachmentNotes`).
   - IT Staff and Administrators can create and update Actions Taken.
   - Requesters can view Actions Taken on owned Tickets in read-only mode.
   - Independent action performer: Different IT Staff members may execute and log actions on a Ticket coordinated by a primary Ticket Owner.
2. **Ticket Workflow & Formal Resolution Gate**:
   - Enforce strict status transitions across `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, and `CANCELLED`.
   - Requester indication that a problem appears resolved is purely advisory and does NOT directly set status to `RESOLVED`.
   - IT Staff or Administrator must formally review work and update status to `RESOLVED` or `CLOSED`.
   - Concurrency / Stale-update handling (`updatedAt` check / optimistic concurrency control).
3. **Role-Appropriate Dashboards**:
   - **Requester Dashboard**: Summarizes authenticated user's Tickets (Total Open, Waiting for Requester, Recently Updated, Recently Resolved) with Quick Actions and drill-down links.
   - **IT Staff Dashboard**: Summarizes operational queue metrics (Unassigned Tickets, My Assigned Tickets, Tickets by Status, Tickets by IT Priority, Recently Updated) with Quick Actions and drill-down links.
   - **Administrator Dashboard**: Reuses IT Staff operational metrics and includes user-account summary counts.
4. **Data Increment, Migration & Seeding**:
   - Prisma schema increment for `ActionTaken` model.
   - Non-destructive PostgreSQL migration and backfill strategy for legacy Tickets without actions.
   - Idempotent seed script covering realistic multi-status tickets, 0/1/multiple actions, and zero/non-zero dashboard metrics.
5. **Final Hardening, Polish & Full Regression**:
   - Full backward compatibility for Labs 1-3 (Auth, User Management, Ticket Queue, Public Comments, Internal Notes, Attachments).
   - Consistent Zen Green UI, error feedback, loading states, accessible focus indicators, and responsive layouts (Desktop, Tablet, Mobile).

### 3.2 Explicitly Excluded Work (per Handout Section 4.2)
- Automatic SLA clocks, escalation engines, on-call scheduling, and breach notifications.
- Email, SMS, LINE, push, or other external notification services.
- Inventory consumption, spare-parts management, purchasing, or cost accounting for services.
- Time-sheet billing, payroll, or detailed labor-cost calculation.
- Multi-level approval workflows and electronic signatures.
- Advanced business-intelligence tools, custom report builders, or export warehouses.
- Multi-tenant organizations and production-scale cloud operations.
- New product features not approved in this Sprint 4 engineering contract.

---

## 4. Functional Requirements

### 4.1 Actions Taken (FR-ACT)
- **FR-ACT-01**: IT Staff and Administrators MUST be able to create an Action Taken record under any accessible Ticket.
- **FR-ACT-02**: The system MUST automatically record the current authenticated IT Staff/Admin user as `performedById` and set `createdAt` timestamp upon Action Taken creation.
- **FR-ACT-03**: The system MUST require `description` and `result` fields when creating or updating an Action Taken.
- **FR-ACT-04**: The system MUST require a non-empty `followUpNote` whenever `followUpRequired` is set to `true`.
- **FR-ACT-05**: IT Staff and Administrators MUST be able to update an existing Action Taken record under accessible Tickets.
- **FR-ACT-06**: Requesters MUST be able to view all Actions Taken on their owned Tickets in read-only mode, but MUST NOT be permitted to create, edit, or delete Actions Taken.

### 4.2 Ticket Workflow & Resolution Gate (FR-WF)
- **FR-WF-01**: The system MUST enforce valid status transitions based on the predefined Ticket Status Matrix.
- **FR-WF-02**: The system MUST treat Requester's "Problem Appears Resolved" input as advisory only, updating an advisory flag/comment without transitioning status to `RESOLVED`.
- **FR-WF-03**: The system MUST require IT Staff or Administrator authorization to transition a Ticket to `RESOLVED` or `CLOSED`.
- **FR-WF-04**: The system MUST reject stale or concurrent status updates when a Ticket has been modified by another user since it was retrieved.

### 4.3 Role-Based Dashboards (FR-DASH)
- **FR-DASH-01**: The system MUST provide a Requester Dashboard returning metrics for the authenticated Requester: Total Open Tickets, Tickets Waiting for Requester, Recently Updated Tickets, and Recently Resolved Tickets.
- **FR-DASH-02**: The system MUST provide an IT Staff Dashboard returning metrics: Unassigned Tickets, My Assigned Tickets, Tickets by Status, Tickets by IT Priority, and Recently Updated Tickets.
- **FR-DASH-03**: The system MUST provide Administrator access to IT Staff operational metrics plus user-account summary metrics.
- **FR-DASH-04**: Dashboard metric cards MUST support drill-down navigation to pre-filtered Ticket Queue lists.

### 4.4 Final Application Hardening & Regression (FR-HARD)
- **FR-HARD-01**: All features from Labs 1, 2, and 3 MUST remain fully functional without regression.
- **FR-HARD-02**: All forms and inputs MUST protect user-entered data during recoverable errors and render clear validation messages.
- **FR-HARD-03**: All screens MUST adhere to Zen Green design guidelines, support responsive viewports (Desktop, Tablet, Mobile), and pass accessibility checks (keyboard focus, ARIA labels, semantic markup).

---

## 5. Business Rules (BR)

| BR ID | Business Rule Statement |
| :--- | :--- |
| **BR-01** | Action Taken belongs to exactly one Ticket (Parent-Child relationship). |
| **BR-02** | The Ticket Owner coordinates the Ticket, but an Action Taken may be performed and recorded by a different active IT Staff or Administrator member. |
| **BR-03** | Only active IT Staff and Administrator users may create or update Action Taken records. Requesters are strictly read-only. |
| **BR-04** | If `followUpRequired` is `true`, `followUpNote` MUST be non-empty and contains at least 3 characters. |
| **BR-05** | Permitted Ticket Status Transitions: <br> • `NEW` → `OPEN`, `IN_PROGRESS`, `CANCELLED`<br> • `OPEN` → `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`<br> • `IN_PROGRESS` → `WAITING_FOR_REQUESTER`, `RESOLVED`, `OPEN`, `CANCELLED`<br> • `WAITING_FOR_REQUESTER` → `IN_PROGRESS`, `RESOLVED`, `CANCELLED`<br> • `RESOLVED` → `CLOSED`, `REOPENED`<br> • `CLOSED` → `REOPENED`<br> • `REOPENED` → `IN_PROGRESS`, `RESOLVED`, `CANCELLED`<br> • `CANCELLED` → (Terminal state) |
| **BR-06** | A Requester indicating "Problem Appears Resolved" is advisory and does NOT change Ticket status to `RESOLVED`. Formal resolution requires IT Staff or Admin action. |
| **BR-07** | Dashboard metrics MUST be calculated server-side from authoritative database queries and MUST respect user role and ownership scoping. |
| **BR-08** | Stale update protection: API requests updating Ticket status or Actions Taken MUST supply `updatedAt` version token or current version timestamp. If the backend record has been modified in the interim, the system MUST reject the update with `409 Conflict`. |

---

## 6. UI Specification Summary

- **IT Staff Dashboard Screen**: Top metric cards (New, Open, In Progress, Waiting for Requester, My Assigned), Recent Tickets list with status badges, and Quick Action buttons (Create Ticket, Search Tickets, My Queue).
- **Requester Dashboard Screen**: Top metric cards (My Open Tickets, In Progress, Resolved, Closed), Recent Tickets list, and Quick Actions (Create Ticket, View My Tickets).
- **Actions Taken Panel on Ticket Detail**: Integrated tab or section on Ticket Detail page showing timeline list of actions, action date/time, performer badge, result status, follow-up flags, attachment notes, and a collapsible/modal form to Add/Edit Action Taken for authorized IT Staff.

---

## 7. Data Changes & Database Model

### 7.1 Prisma Model (`ActionTaken`)
```prisma
model ActionTaken {
  id                String   @id @default(uuid())
  ticketId          String
  ticket            Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  description       String
  result            String
  performedById     String
  performedBy       User     @relation(fields: [performedById], references: [id])
  followUpRequired  Boolean  @default(false)
  followUpNote      String?
  attachmentNotes   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([ticketId])
  @@index([performedById])
}
```

### 7.2 Migration & Backfill Strategy
- Prisma migration will add the `ActionTaken` table with foreign key relations to `Ticket` and `User`.
- Legacy tickets without actions will return an empty array `[]` for `actionsTaken` without failing or breaking existing views.

---

## 8. API Contract Summary

- `GET /api/tickets/:id/actions-taken`: Retrieve all actions taken for a ticket (Scoped by role/ownership).
- `POST /api/tickets/:id/actions-taken`: Create a new action taken (IT Staff / Admin only).
- `PUT /api/actions-taken/:actionId`: Update an existing action taken (IT Staff / Admin only).
- `GET /api/dashboard/requester`: Retrieve dashboard metrics for authenticated Requester.
- `GET /api/dashboard/staff`: Retrieve dashboard metrics for authenticated IT Staff / Admin.

---

## 9. Acceptance Criteria (AC)

- **AC-01**: Given a permitted IT Staff user and valid data, when an Action Taken is created, then it is saved under the correct Ticket with the authenticated creator as `performedBy`.
- **AC-02**: Given an authenticated Requester, when dashboard data is retrieved, then only metrics and recent Tickets owned by that Requester are returned.
- **AC-03**: Given an IT Staff user on a Ticket in `IN_PROGRESS`, when updating status to `RESOLVED`, then status changes to `RESOLVED` and timeline logs the change.
- **AC-04**: Given a Requester viewing a Ticket, when clicking "Problem Appears Resolved", an advisory note is created without changing status directly to `RESOLVED`.
- **AC-05**: Given an Action Taken form with `followUpRequired = true`, when submitted without `followUpNote`, then the system blocks submission with a validation error.
- **AC-06**: Given a concurrent update scenario where a Ticket is modified by User A, when User B submits a stale update, then the system returns a `409 Conflict` error.

---

## 10. Definition of Done (DoD)
- [ ] `docs/lab-04/specification.md` created and approved.
- [ ] `docs/lab-04/api-spec.md`, `ui-spec.md`, and `tests.md` created.
- [ ] Prisma model migrated and seeded.
- [ ] All REST API endpoints implemented and unit/integration tested.
- [ ] All UI screens implemented with Zen Green styling and tested.
- [ ] All automated tests passing (Unit, API, UI, E2E).
- [ ] Full regression of Lab 1-3 verified without breaking changes.

---

## 11. Assumptions and Decisions
- **Decision 1**: Action performer is recorded automatically from the active session (`req.user.id`) to prevent impersonation.
- **Decision 2**: Dashboards execute optimized Prisma aggregate queries rather than fetching full ticket arrays to maintain high performance.
