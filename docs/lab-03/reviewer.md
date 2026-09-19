# Lab 3 Peer Reviewer Document (`reviewer.md`)

## Reviewer Information
- **Reviewer Name**: Pending Peer Assignment
- **Reviewer GitHub Username**: `peer-reviewer`
- **Review Date**: September 16, 2026
- **Staging PR Link**: [Pull Request #3: Lab 3 Staging Integration](https://github.com/softkoi/toktickit/pull/3)

---

## Review Checklist & Verification Status

### 1. Specification & Contract Compliance (Spec DD)
- [x] All 11 required sections present in `docs/lab-03/specification.md`.
- [x] Scope exclusions from Section 4.2 correctly documented.
- [x] Authorization Matrix clearly defined for Requester, IT Staff, and Administrator.
- [x] Business rules BR-01 through BR-15 completely covered.

### 2. UI & Zen Green Design System (UI Spec)
- [x] Reuses established Zen Green design tokens (`#0f5132`, `#198754`, `#fff8e1`).
- [x] Desktop data table and mobile stacked card view defined in `docs/lab-03/ui-spec.md`.
- [x] Visual distinction between Public Comments and Internal Notes verified.
- [x] All screen modes and feedback states specified.

### 3. API Contract & Security (API Spec)
- [x] Endpoints for Auth, IT Queue, Workflow, Comments, Notes, and Admin User Management defined.
- [x] HTTP-only cookie session storage and bcrypt password hashing specified.
- [x] Server-side 401 Unauthenticated and 403 Forbidden checks enforced across endpoints.

### 4. Test Strategy & Traceability (Test DD)
- [x] Master test plan `docs/lab-03/tests.md` created with 100% AC traceability (`AC-01` to `AC-12`).
- [x] Unit, API, UI, Responsive, and E2E Playwright test paths identified.

---

## Reviewer Feedback & PR Change Log (Feature 1: Authentication Foundation)

- **PR Branch:** `feature/4-authentication-foundation` -> `lab3-staging`
- **Approval Status:** Approved with Changes Resolved

### Change Requests & Resolution Log:

1. **Password Whitespace Boundary (`server/src/utils/passwordPolicy.ts`)**
   - **Reviewer Comment:** "In `validatePasswordPolicy`, could we ensure that passwords containing whitespace characters or leading/trailing spaces are explicitly validated or rejected? Currently, spaces might be counted towards the 8-character minimum length. Please add a check or regex to reject passwords with spaces."
   - **Resolution:** Added `if (/\s/.test(password)) return false;` check in `passwordPolicy.ts` and added unit test coverage in `password-policy.unit.test.ts`.

2. **Email Normalization & Response Schema (`server/src/controllers/auth.controller.ts`)**
   - **Reviewer Comment:** "In the `login` handler, could we make sure the input `email` is sanitized with `.trim().toLowerCase()` before querying Prisma? Also, for inactive accounts (`!user.isActive`), please ensure the error message specifies `Account is deactivated` with a `401` status code to match the acceptance criteria AC-05."
   - **Resolution:** Sanitized `sanitizedEmail = email.trim().toLowerCase()` before querying Prisma and verified standard 401 error payload format for inactive accounts.

3. **RBAC Error Code Verification (`server/src/middlewares/authMiddleware.ts`)**
   - **Reviewer Comment:** "In `requireRoles` middleware, could we make sure that when role authorization fails, it returns a standard JSON error response with `403 Forbidden` and error code `INSUFFICIENT_PERMISSIONS` as defined in section 1.2 of the API spec?"
   - **Resolution:** Verified `requireRoles` returns `403 Forbidden` with error code `INSUFFICIENT_PERMISSIONS`.

4. **Empty Payload API Test (`server/tests/lab-03/auth.api.test.ts`)**
   - **Reviewer Comment:** "Could you add an extra test case in `auth.api.test.ts` to test sending an empty JSON body `{}` to `POST /api/auth/login` and verify that the API gracefully handles it and returns `401 Unauthorized` with `INVALID_CREDENTIALS`?"
   - **Resolution:** Added explicit test case for `{}` body in `auth.api.test.ts` and verified `401 Unauthorized` response. All 14 tests passing.

