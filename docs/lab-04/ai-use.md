# Lab 4 AI Assistance Log (`ai-use.md`)

## LLM Identification
- **Model Used**: Gemini 3.6 Flash (High) / Antigravity AI Pair Programmer
- **Date**: October 31, 2026

---

## Key Prompts & Iterative AI Interactions

1. **Prompt 1 (Phase 1 Engineering Contract & Specification)**:
   > *"Sprint 4 — Actions Taken, Dashboards, and Final Regression: สร้าง specification.md, api-spec.md, ui-spec.md, tests.md"*
   - **Result**: AI authored complete engineering specifications for Lab 4, defining Actions Taken data model, strict Ticket Workflow state transition graph, Resolution Gate (BR-01 to BR-05), and Role-Based Dashboards metrics and mock contracts.

2. **Prompt 2 (Phase 2 Actions Taken Backend Foundation & APIs)**:
   > *"สร้าง Action Taken Backend API พร้อม tests โดยมี create, read, update, delete และ RBAC guard"*
   - **Result**: AI created `prisma/schema.prisma` ActionTaken model migration, `actionTaken.controller.ts`, `actionTaken.routes.ts`, and 12 automated integration tests in `actions-taken.api.test.ts`.

3. **Prompt 3 (Phase 3 Actions Taken Frontend Timeline & Validation)**:
   > *"สร้าง Actions Taken component บนหน้า Ticket Detail โดยรองรับ validation followUpRequired และ role permission"*
   - **Result**: AI implemented `ActionsTaken.tsx` with dynamic form validation, timeline presentation, follow-up note enforcement, and read-only styling for Requesters. Verified with Vitest unit tests in `ActionsTaken.test.tsx`.

4. **Prompt 4 (Phase 4 Strict Ticket Workflow & Resolution Gate)**:
   > *"Feature 4: Strict Ticket Workflow & Resolution Gate... ให้มี permittedTransitions ใน error payload และเตือนก่อน resolve"*
   - **Result**: AI updated `ticket.controller.ts` with strict Resolution Gate blocking transition to `RESOLVED` unless at least one valid Action Taken exists (`BR-01`), returning 400 with `RESOLUTION_GATE_FAILED` and `permittedTransitions`. Created comprehensive tests in `ticket-workflow.api.test.ts`.

5. **Prompt 5 (Phase 5 Role-Based Dashboards & Hardening)**:
   > *"ทำ issue ที่ 5 เลยแต่ว่าผมขอ comment 1 บท พอ โดยรอบนี้ผมขอแค่ 3 commit พอ"*
   - **Result**: AI engineered `dashboard.controller.ts` with `GET /api/dashboard/requester` and `GET /api/dashboard/staff`, built `RequesterDashboard.tsx` and `StaffDashboard.tsx`, integrated routing in `App.tsx` and `Navbar.tsx`, and added UI component tests in `Dashboards.test.tsx`.

---

## Reflection on AI Specification & Coding Agent Use ("My Reflection")

Employing an AI pair programming agent throughout Sprint 4 accelerated our adherence to Specification-Driven Development (Spec DD) and Test-Driven Development (TDD). In particular, defining the exact state machine rules and Resolution Gate constraints in `docs/lab-04/specification.md` before coding prevented boundary inconsistencies between frontend status dropdowns and backend transition checks.

The AI assistant also proved instrumental in maintaining clean Git hygiene and a reliable peer review cadence. By splitting complex features into structured, logical commits and providing clear, actionable feedback prompts, the development lifecycle remained transparent, maintainable, and aligned with industry-standard continuous integration practices.
