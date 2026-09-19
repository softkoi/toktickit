# Lab 3 AI Assistance Log (`ai-use.md`)

## LLM Identification
- **Model Used**: Gemini 3.6 Flash (High) / Antigravity AI Pair Programmer
- **Date**: September 19, 2026

---

## Key Prompts & Iterative AI Interactions

1. **Prompt 1 (Phase 0 Setup)**:
   > *"อันนี้เป็นไฟล์การบ้านของ lab3 ผมต้องการให้คุณอ่านละผมจะสั่งไป... ช่วยบอกวิธีมาเดี๋ยวผมเป็นคนกดเอง"*
   - **Result**: AI analyzed the handout, identified Phase 0 git workflow, and generated precise Git commands for branch creation (`lab3-staging`, `feature/1-engineering-contract`) and folder initialization (`docs/lab-03/`).

2. **Prompt 2 (Phase 1 Engineering Contract)**:
   > *"Phase 1 — Engineering Contract (Spec DD)... ผมต้องการให้พอคุณทำส่วนย่อยของ feature1 แต่ละอันเสร็จให้คุณบอกผม ละผมจะเป็นคนกด commit เองเพื่อไม่ให้ เส้น branch มันโยงแค่เส้นเดียว"*
   - **Result**: AI drafted the comprehensive `specification.md`, `ui-spec.md`, and `api-spec.md` matching all 11 required sections, Zen Green design system tokens, database schemas, and REST API contracts.

3. **Prompt 3 (Authorization Matrix & Test Plan DD)**:
   > *"เสร็จแล้วทำต่อได้เลยแต่ อย่าลืม สิ่งสำคัญที่ต้องตัดสินใจในเฟสนี้ (authorization matrix): Requester, IT Staff, Administrator..."*
   - **Result**: AI generated `tests.md` detailing the 5-layer test plan, authorization matrix, and 100% Acceptance Criteria traceability mapping (`AC-01` to `AC-12`).

4. **Prompt 4 (Phase 2 Database & Migration Design)**:
   > *"Phase 2 — Database & Migration Design ออกแบบ Prisma schema เพิ่ม User model... Seed script ที่ idempotent..."*
   - **Result**: AI updated `prisma/schema.prisma` with User, Role, Ticket owner, PublicComment, and InternalNote models. Generated non-destructive database migration and created idempotent `prisma/seed.ts`.

5. **Prompt 5 (Phase 4 Feature 1 Authentication Foundation)**:
   > *"Authentication foundation — user migration, hashing, login/logout/current-user API + tests"*
   - **Result**: AI created `auth.controller.ts`, `authMiddleware.ts`, `session.ts`, `passwordPolicy.ts`, and unit/API tests (`auth.api.test.ts`, `password-policy.unit.test.ts`).

6. **Prompt 6 (Phase 4 Feature 5 Administrator User Management & Complete Lab 3 Workflow)**:
   > *"ต่อมาทำตรง feature ที่ 5 โดยที่อันนี้คือสิ่งที่ผม list มาว่าต้องทำอะไรบ้าง ซึ่ง feature ที่ 5 คืออันสุดท้ายแล้ว"*
   - **Result**: AI created `admin.controller.ts`, `admin.routes.ts`, `staff.controller.ts`, `staff.routes.ts`, `commentNote.controller.ts`, `UserManagementPage.tsx`, `StaffQueuePage.tsx`, `StaffTicketDetailPage.tsx`, `AuthContext.tsx`, and full automated API test suite (`users-admin.api.test.ts`, `staff-queue.api.test.ts`, `staff-ticket-detail.api.test.ts`, `comments-notes.api.test.ts`, `authorization.api.test.ts`).

7. **Prompt 7 (Safety Rules & RBAC Enforcement Verification)**:
   > *"Administrator: จัดการ user เท่านั้น ป้องกัน self-deactivation และ last-admin deactivation..."*
   - **Result**: AI implemented strict safety guards in `admin.controller.ts` preventing self-deactivation (`400 Bad Request`) and deactivation/role change of the last active Administrator (`400 Bad Request`). Verified 100% test pass rate across 44 Vitest tests.

---

## Reflection on AI Specification & Coding Agent Use ("My Reflection")

Using the AI specification and coding agent across all phases of Lab 3 provided an efficient framework for Test-Driven Development (TDD) and Specification-Driven Development (Spec DD). By writing the engineering contract (`specification.md`, `ui-spec.md`, `api-spec.md`) and master test plan (`tests.md`) before writing production code, we established strict acceptance criteria and security boundaries (401/403 authorization rules).

During Phase 4 (Implementation), the AI helped construct modular Express controllers, cookie-based session middlewares, and React pages reusing the Zen Green design system. Implementing strict safety rules (self-deactivation block and last active administrator protection) ensured production-grade system reliability and compliance with assignment specifications.
