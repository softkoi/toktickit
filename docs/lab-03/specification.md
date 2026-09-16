# Lab 3 Engineering Specification: TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens

## 1. Sprint Goal
Deliver an enterprise-grade authentication, role-based authorization, IT Staff ticket workflow, and minimalist Administrator user management system for TokTickIT. This sprint replaces the temporary Lab 2 Development Requester selector with secure identity management, introduces operational IT Staff queueing, claim/reassignment, IT Priority management, status workflows, public comments, private internal notes, and Administrator account lifecycle controls while preserving all existing Lab 2 ticket and attachment capabilities.

---

## 2. Stakeholder Request
"The temporary Requester selector was useful for development, but the system now needs real users. Replace it with secure login. Administrators need a simple User Management screen where they can view users, create an account, assign one role, update basic account information, activate or deactivate an account, and set a new initial password. A user signing in with an initial password must choose a new password before entering the application.

Requesters must continue using the ticket functions built in Lab 2, but the current Requester must now come from the authenticated account. IT Staff need a professional Ticket Queue where they can find work, open Ticket Detail, claim or reassign a Ticket, set IT Priority, communicate with the Requester through Public Comments, record private Internal Notes, and update the Ticket through its permitted workflow. Requesters may indicate that a problem appears resolved, but IT Staff remain responsible for formally resolving or closing the Ticket.

Protect every API and screen according to role and ownership. Hiding a button is not authorization. Continue using the Zen Green design language and reusable components established in Lab 2."

---

## 3. Scope

### 3.1 Included Work
1. **Authentication & Session Management**:
   - Secure email/password authentication using HTTP-only cookies and bcrypt password hashing.
   - Session validation, logout session destruction, current-user profile (`/api/auth/me`).
   - Mandatory first-login password change flow for initial/reset passwords.
2. **Role-Based Authorization & Ownership**:
   - Three distinct roles: `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`.
   - Server-side enforcement on all endpoints (401 Unauthenticated, 403 Forbidden).
   - Strict ticket ownership scoping for Requesters (access only owned tickets/attachments).
3. **Lab 2 Requester Integration**:
   - Seamless migration from `RequesterUser` to authenticated `User` model.
   - Removal of Development Requester selector and Change Requester UI.
   - Continuation of ticket creation, listing, detail, and attachment upload/view/remove.
   - Ability for Requester to post Public Comments and request resolution ("Problem Appears Resolved").
4. **IT Staff Ticket Queue & Workflow**:
   - Dedicated IT Staff Ticket Queue with search, filtering (status, priority, owner), sorting, and pagination.
   - Detailed Ticket view supporting ownership claim and reassignment to active IT Staff/Admin.
   - Operational IT Priority management (copies Requested Priority initially, updatable by IT Staff/Admin).
   - Validated Ticket Status transitions (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`).
   - Public Comments (visible to Requester, IT Staff, Admin) and Internal Notes (restricted to IT Staff, Admin).
5. **Minimalist Administrator User Management**:
   - User list with name/email search, role filter, pagination, and status indicators.
   - Create user with single role assignment, activation state, and initial password.
   - Edit user name, email, role, and activation state.
   - Set new initial password (triggers mandatory password change at next login).
   - Safety checks: Prevent self-deactivation, prevent deactivating the last active Administrator, reject duplicate emails.
6. **Data Increment & Migration**:
   - Unified `User` Prisma model replacing `RequesterUser`.
   - Models for `PublicComment` and `InternalNote`.
   - Non-destructive database migration and idempotent seed script.

### 3.2 Explicitly Excluded Work (per Section 4.2)
- Email invitations, password-reset emails, multi-factor authentication (MFA), social login, and SSO.
- Self-registration and Requester-created account registration.
- Actions Taken by IT Staff (deferred to Lab 4).
- Formal SLA calculation, escalation rules, and notification services.
- Dashboards and KPI analytics beyond simple queue counts.
- Multi-tenant organizations, departments, and customer administration.
- Production-grade cloud deployment infrastructure changes.
- Multiple roles assigned to a single user.
- User deletion, bulk user operations, user import/export, and account history logs.
- Department, organization, profile photo, and extended profile fields.
- Account unlocking workflows or administrator approval queues.
- Advanced user list controls (multi-column sorting, simultaneous complex filter stacks).

---

## 4. Functional Requirements

### 4.1 Authentication & Session (FR-AUTH)
- **FR-AUTH-01**: The system MUST allow users to authenticate using valid email and password credentials.
- **FR-AUTH-02**: The system MUST reject authentication for inactive user accounts with a safe error message.
- **FR-AUTH-03**: The system MUST require users with `mustChangePassword = true` to set a new password before accessing application functions.
- **FR-AUTH-04**: The system MUST support user logout by invalidating the server session and clearing the auth cookie.
- **FR-AUTH-05**: The system MUST provide an endpoint to return the currently authenticated user's identity, role, and password status.

### 4.2 Authorization & Access Control (FR-ACC)
- **FR-ACC-01**: The system MUST enforce server-side role and ownership authorization on every protected API endpoint.
- **FR-ACC-02**: Requesters MUST only access tickets and attachments where `ticket.requesterId == currentUser.id`.
- **FR-ACC-03**: IT Staff MUST have access to the IT Ticket Queue, ticket details, claim/reassign actions, IT Priority, permitted status changes, public comments, and internal notes.
- **FR-ACC-04**: Administrators MUST have exclusive access to User Management APIs and screens.
- **FR-ACC-05**: The system MUST return 401 Unauthenticated for unauthenticated requests and 403 Forbidden for unauthorized requests without leaking resource existence.

### 4.3 IT Staff Ticket Operations (FR-STAFF)
- **FR-STAFF-01**: IT Staff MUST be able to query the IT Ticket Queue with text search (summary, description, ticket number), filters (status, priority, owner), sorting, and pagination.
- **FR-STAFF-02**: IT Staff MUST be able to claim unassigned tickets or reassign tickets to any active IT Staff or Administrator user.
- **FR-STAFF-03**: IT Staff MUST be able to modify the IT Priority of a ticket independently of Requested Priority.
- **FR-STAFF-04**: IT Staff MUST be able to execute valid ticket status transitions according to the state transition matrix.
- **FR-STAFF-05**: IT Staff MUST be able to view and post Public Comments on any ticket.
- **FR-STAFF-06**: IT Staff MUST be able to view and post private Internal Notes on any ticket.

### 4.4 Requester Operations & Regression (FR-REQ)
- **FR-REQ-01**: All Lab 2 ticket creation, detail viewing, listing, and attachment management MUST continue functioning seamlessly using the authenticated identity.
- **FR-REQ-02**: Requesters MUST be able to view and post Public Comments on their owned tickets.
- **FR-REQ-03**: Requesters MUST be able to indicate that a ticket appears resolved, transitioning the status to `WAITING_FOR_REQUESTER` or requesting resolution.

### 4.5 Administrator User Management (FR-ADM)
- **FR-ADM-01**: Administrators MUST be able to list all users with search by name/email and optional role filter.
- **FR-ADM-02**: Administrators MUST be able to create new user accounts specifying Name, Email, Role (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), Active state, and Initial Password.
- **FR-ADM-03**: Administrators MUST be able to update an existing user's Name, Email, Role, and Active state.
- **FR-ADM-04**: Administrators MUST be able to set a new initial password for any user, marking `mustChangePassword = true`.
- **FR-ADM-05**: The system MUST prevent an Administrator from deactivating their own account.
- **FR-ADM-06**: The system MUST prevent deactivation or role change that would leave zero active Administrators in the system.

---

## 5. Business Rules

| BR ID | Business Rule Description | Enforced Layer |
| :--- | :--- | :--- |
| **BR-01** | Only an active user account (`isActive = true`) with valid credentials may authenticate. Inactive accounts must be rejected with safe credentials error. | Backend (Auth API) |
| **BR-02** | A user marked as requiring a password change (`mustChangePassword = true`) cannot access normal application endpoints until a valid new password is saved. | Backend & Frontend |
| **BR-03** | The authenticated user identity (from session token/cookie), not a `requesterId` supplied by the client, determines ownership of Requester operations. | Backend (Middleware) |
| **BR-04** | Public Comments are visible to Requester, IT Staff, and Administrator. Internal Notes are visible ONLY to IT Staff and Administrator. Requesters must never be allowed to read or create Internal Notes. | Backend & Frontend |
| **BR-05** | A Requester may indicate that a problem appears resolved, but cannot formally set the Ticket to `RESOLVED` or `CLOSED`. Formal resolution is reserved for IT Staff and Administrator. | Backend (Workflow API) |
| **BR-06** | Passwords must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character. Passwords must be hashed using bcrypt (cost factor 10+) and never stored in plaintext. | Backend & Frontend |
| **BR-07** | User emails must be unique across the system (case-insensitive check). Duplicate email registration or update must be rejected with `409 Conflict`. | Backend (User API) |
| **BR-08** | Each user account has exactly one assigned role: `REQUESTER`, `IT_STAFF`, or `ADMINISTRATOR`. Role updates take effect on the user's next authenticated request. | Backend & Database |
| **BR-09** | Ticket Owners must be active users with role `IT_STAFF` or `ADMINISTRATOR`. Requesters cannot own tickets as Ticket Owner (only as Ticket Requester). | Backend (Ticket API) |
| **BR-10** | IT Priority initially defaults to Requested Priority when a ticket is created, but IT Priority can subsequently be updated only by IT Staff or Administrator. | Backend (Ticket API) |
| **BR-11** | Ticket status transitions must strictly follow the defined state machine matrix: <br>- `NEW` -> `OPEN`, `CANCELLED`<br>- `OPEN` -> `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `CANCELLED`<br>- `IN_PROGRESS` -> `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`<br>- `WAITING_FOR_REQUESTER` -> `IN_PROGRESS`, `RESOLVED`, `CANCELLED`<br>- `RESOLVED` -> `CLOSED`, `REOPENED`<br>- `CLOSED` -> `REOPENED`<br>- `REOPENED` -> `IN_PROGRESS`, `RESOLVED`<br>- `CANCELLED` -> (Terminal state) | Backend (Workflow API) |
| **BR-12** | Public Comments and Internal Notes are append-only. Editing and deletion are strictly forbidden in Lab 3. Content cannot be empty or whitespace-only, with a max length of 2000 characters. | Backend & Database |
| **BR-13** | An Administrator is strictly forbidden from deactivating their own currently logged-in account (`400 Bad Request`). | Backend (Admin API) |
| **BR-14** | The system must maintain at least one active user with role `ADMINISTRATOR` at all times. Any action that deactivates or changes the role of the last active Administrator must be rejected (`400 Bad Request`). | Backend (Admin API) |
| **BR-15** | User deletion is disabled. Inactive users are disabled via `isActive = false`, preserving complete foreign key history for tickets, comments, and notes. | Backend & Database |

---

## 6. UI Specification Summary
The UI extends the Zen Green design system established in Lab 2 using React, TypeScript, and Tailwind/Vanilla CSS utilities.

### 6.1 Application Shell & Navigation
- **Header**: Displays TokTickIT logo, role-specific navigation links, current user name, role badge, and profile/logout menu.
- **Role Navigation**:
  - `REQUESTER`: My Tickets, Create Ticket.
  - `IT_STAFF`: Ticket Queue, Create Ticket (optional/as requester), Profile.
  - `ADMINISTRATOR`: User Management, Ticket Queue (view mode), Profile.
- **Dev Requester Switcher**: Completely removed from all screens.

### 6.2 Key Screens & Modes
1. **Login Screen**:
   - Clean card-based login with email, password inputs, submit state, and error banner.
2. **Mandatory Password Change Screen**:
   - Modal/Fullscreen view enforcing old password (if applicable), new password, confirmation, and live rule validation checklist.
3. **Requester Ticket Detail**:
   - Extends Lab 2 Ticket Detail by appending a Public Comments section and a "Mark as Resolved" action button.
4. **IT Staff Ticket Queue Screen**:
   - **Desktop**: Full data table showing Ticket #, Created Date, Summary, Category, Requested Priority badge, IT Priority badge, Status badge, Owner, Actions.
   - **Mobile/Tablet**: Stacked card view displaying key details, badges, and quick-tap detail drawer/page.
   - Search input, status dropdown filter, priority dropdown filter, owner filter, pagination controls.
5. **IT Staff Ticket Detail Screen**:
   - Ticket details, Claim/Reassign owner dropdown, IT Priority selector, Status transition dropdown.
   - Tabbed or side-by-side view for **Public Comments** (Zen Green styling) and **Internal Notes** (amber/gold warning border badge clearly indicating private internal note).
6. **Administrator User Management Screen**:
   - User table displaying Name, Email, Role badge, Status badge (Active/Inactive), Edit action button.
   - Search bar (Name/Email) and Role filter dropdown.
   - Slide-over or Modal for Create User, Edit User, and Reset Initial Password.

*(For complete layout rules, responsive breakpoints, and visual component states, refer to [`ui-spec.md`](file:///d:/SoftwareEngineer/toktickit/docs/lab-03/ui-spec.md))*

---

## 7. Data Changes

### 7.1 Database Schema Evolution (Prisma)

```prisma
enum Role {
  REQUESTER
  IT_STAFF
  ADMINISTRATOR
}

model User {
  id                 Int              @id @default(autoincrement())
  name               String
  email              String           @unique
  passwordHash       String
  role               Role             @default(REQUESTER)
  mustChangePassword Boolean          @default(true)
  isActive           Boolean          @default(true)
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt

  submittedTickets   Ticket[]         @relation("SubmittedTickets")
  ownedTickets       Ticket[]         @relation("OwnedTickets")
  publicComments     PublicComment[]
  internalNotes      InternalNote[]
}

model Ticket {
  id                Int             @id @default(autoincrement())
  ticketNumber      String          @unique
  requesterId       Int
  ownerId           Int?
  categoryId        Int
  relatedSystemId   Int
  summary           String
  description       String
  requestedPriority String          // "LOW", "MEDIUM", "HIGH"
  itPriority        String          // "LOW", "MEDIUM", "HIGH"
  currentStatus     String          @default("NEW") // NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED, CLOSED, REOPENED, CANCELLED
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  requester         User            @relation("SubmittedTickets", fields: [requesterId], references: [id])
  owner             User?           @relation("OwnedTickets", fields: [ownerId], references: [id])
  category          Category        @relation(fields: [categoryId], references: [id])
  relatedSystem     RelatedSystem   @relation(fields: [relatedSystemId], references: [id])
  attachments       Attachment[]
  publicComments    PublicComment[]
  internalNotes     InternalNote[]

  @@index([requesterId])
  @@index([ownerId])
  @@index([categoryId])
  @@index([currentStatus])
}

model PublicComment {
  id        Int      @id @default(autoincrement())
  ticketId  Int
  authorId  Int
  content   String
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])

  @@index([ticketId])
  @@index([authorId])
}

model InternalNote {
  id        Int      @id @default(autoincrement())
  ticketId  Int
  authorId  Int
  content   String
  createdAt DateTime @default(now())

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id])

  @@index([ticketId])
  @@index([authorId])
}
```

### 7.2 Data Migration Strategy
1. **Model Transformation**: Map existing `RequesterUser` table data to `User` table, setting `role = REQUESTER`, `passwordHash = bcrypt("Password123!")`, `mustChangePassword = false`, `isActive = true`.
2. **Foreign Key Migration**: Point `Ticket.requesterId` to `User.id`.
3. **Prisma Drop/Migration**: Safely replace `RequesterUser` references without losing existing categories, related systems, or ticket numbers.

### 7.3 Seed Data Requirements (Section 5.3)
- **Requesters**: 4 Active (`requester1@toktickit.com` to `requester4@toktickit.com`), 1 Inactive (`requester.inactive@toktickit.com`).
- **IT Staff**: 3 Active (`staff1@toktickit.com` to `staff3@toktickit.com`), 1 Inactive (`staff.inactive@toktickit.com`).
- **Administrators**: 1 Active (`admin@toktickit.com`).
- **Default Password**: `Password123!` (triggers mandatory password change for new seeded accounts where `mustChangePassword = true`).
- **Tickets**: 10+ tickets distributed across requesters, statuses, priorities, and assigned/unassigned owners.
- **Comments/Notes**: Pre-populated sample public comments and internal notes.

---

## 8. API Contract Summary
The REST API enforces JSON request/response formats, HTTP status codes, and HTTP-only session cookies.

- **Authentication Endpoints**:
  - `POST /api/auth/login`: Authenticate email/password.
  - `POST /api/auth/logout`: Destroy session.
  - `GET /api/auth/me`: Get current authenticated user profile & role.
  - `POST /api/auth/change-password`: Execute mandatory or voluntary password change.
- **IT Queue & Ticket Workflow Endpoints**:
  - `GET /api/staff/tickets`: Paginated, searchable, filterable ticket queue for IT Staff/Admin.
  - `GET /api/staff/tickets/:id`: Detailed ticket view for IT Staff/Admin.
  - `PATCH /api/staff/tickets/:id/claim`: Claim ticket ownership.
  - `PATCH /api/staff/tickets/:id/assign`: Assign/reassign ticket ownership.
  - `PATCH /api/staff/tickets/:id/priority`: Update IT Priority.
  - `PATCH /api/staff/tickets/:id/status`: Update Ticket Status.
  - `POST /api/tickets/:id/resolve-request`: Requester indicates resolution.
- **Comments & Internal Notes Endpoints**:
  - `GET /api/tickets/:id/comments`: Fetch public comments (Requester owned, IT Staff, Admin).
  - `POST /api/tickets/:id/comments`: Create public comment.
  - `GET /api/staff/tickets/:id/notes`: Fetch internal notes (IT Staff, Admin ONLY).
  - `POST /api/staff/tickets/:id/notes`: Create internal note (IT Staff, Admin ONLY).
- **Administrator User Management Endpoints**:
  - `GET /api/admin/users`: Search, filter, and list users.
  - `POST /api/admin/users`: Create user account with role and initial password.
  - `PATCH /api/admin/users/:id`: Edit user details, role, or activation state.
  - `POST /api/admin/users/:id/reset-password`: Set new initial password (`mustChangePassword = true`).

*(For full JSON request/response schemas, query parameters, and status codes, refer to [`api-spec.md`](file:///d:/SoftwareEngineer/toktickit/docs/lab-03/api-spec.md))*

---

## 9. Acceptance Criteria

| AC ID | Acceptance Criterion Description | Target Test File |
| :--- | :--- | :--- |
| **AC-01** | Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access and returns the permitted user identity and role. | `server/tests/lab-03/auth.api.test.ts` |
| **AC-02** | Given a user who must change the initial password (`mustChangePassword = true`), when login succeeds, then normal application screens remain unavailable until a valid new password is saved. | `e2e/lab-03/first-login.spec.ts` |
| **AC-03** | Given an authenticated Requester, when the client supplies another requesterId, then the backend still applies the authenticated identity and does not return another Requester’s data. | `server/tests/lab-03/authorization.api.test.ts` |
| **AC-04** | Given a Requester account, when an Internal Note endpoint is requested, then the operation is rejected (`403 Forbidden`) without exposing note content. | `server/tests/lab-03/comments-notes.api.test.ts` |
| **AC-05** | Given an inactive user account (`isActive = false`), when attempting login, the backend rejects the attempt with a 401 Unauthorized status. | `server/tests/lab-03/auth.api.test.ts` |
| **AC-06** | Given an IT Staff user, when accessing the Ticket Queue API, they can filter by status/priority, search by text, and receive paginated results. | `server/tests/lab-03/staff-queue.api.test.ts` |
| **AC-07** | Given an IT Staff user, when claiming or reassigning a ticket, the ticket owner is updated to the specified active IT Staff/Admin user. | `server/tests/lab-03/staff-ticket-detail.api.test.ts` |
| **AC-08** | Given an invalid ticket status transition (e.g. `NEW` -> `CLOSED`), the backend rejects the request with `400 Bad Request`. | `server/tests/lab-03/staff-ticket-detail.api.test.ts` |
| **AC-09** | Given a Requester, when clicking "Problem Appears Resolved", the ticket status transitions to `WAITING_FOR_REQUESTER` or logs resolution request without allowing formal `CLOSED` status. | `server/tests/lab-03/authorization.api.test.ts` |
| **AC-10** | Given an Administrator, when attempting to deactivate their own account, the backend rejects the operation with `400 Bad Request`. | `server/tests/lab-03/users-admin.api.test.ts` |
| **AC-11** | Given an Administrator, when attempting to deactivate or reassign the role of the last active Administrator, the operation is blocked. | `server/tests/lab-03/users-admin.api.test.ts` |
| **AC-12** | Given a non-Administrator user, when requesting any `/api/admin/*` endpoint, the server returns `403 Forbidden`. | `server/tests/lab-03/authorization.api.test.ts` |

---

## 10. Definition of Done
- [ ] All 3 specification documents (`specification.md`, `ui-spec.md`, `api-spec.md`) complete and approved.
- [ ] Test plan `docs/lab-03/tests.md` created with 100% AC traceability.
- [ ] Prisma schema updated with `User`, `PublicComment`, `InternalNote`, and `Ticket` workflow fields.
- [ ] Migration script tested and idempotent seed script populated with required user profiles and tickets.
- [ ] All backend endpoints implemented with strict 401/403 authorization middleware.
- [ ] Frontend React components created reusing Zen Green theme tokens.
- [ ] Automated unit, integration, and E2E Playwright tests passing.
- [ ] Final reviewer document `docs/lab-03/reviewer.md` and AI use log `docs/lab-03/ai-use.md` completed.

---

## 11. Assumptions and Architectural Decisions
1. **Session Management**: Session state is managed server-side using signed HTTP-only cookies (`toktickit_session`) to protect against XSS token theft.
2. **Password Security**: Passwords are hashed using `bcrypt` with salt rounds = 10. Plaintext passwords are never logged or stored.
3. **User Deletion Policy**: Hard deletion of user accounts is disallowed to preserve historical integrity of created tickets, comments, and notes. Accounts are deactivated via `isActive = false`.
4. **IT Priority Logic**: `itPriority` is defaulted to `requestedPriority` upon creation, allowing IT Staff to override priority later without altering the Requester's original request.
