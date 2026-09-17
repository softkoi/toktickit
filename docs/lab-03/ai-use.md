# Lab 3 AI Assistance Log (`ai-use.md`)

## LLM Identification
- **Model Used**: Gemini 3.6 Flash (High) / Antigravity AI Pair Programmer
- **Date**: September 16, 2026

---

## Key Prompts & Iterative AI Interactions

1. **Prompt 1 (Phase 0 Setup)**:
   > *"อันนี้เป็นไฟล์การบ้านของ lab3 ผมต้องการให้คุณอ่านละผมจะสั่งไป... ช่วยบอกวิธีมาเดี๋ยวผมเป็นคนกดเอง"*
   - **Result**: AI analyzed the PDF handout, identified Phase 0 git workflow, and generated precise PowerShell/Git commands for branch creation (`lab3-staging`, `feature/lab3-spec`) and folder initialization (`docs/lab-03/`).

2. **Prompt 2 (Phase 1 Engineering Contract)**:
   > *"Phase 1 — Engineering Contract (Spec DD)... ผมต้องการให้พอคุณทำส่วนย่อยของ feature1 แต่ละอันเสร็จให้คุณบอกผม ละผมจะเป็นคนกด commit เองเพื่อไม่ให้ เส้น branch มันโยงแค่เส้นเดียว"*
   - **Result**: AI drafted the comprehensive `specification.md`, `ui-spec.md`, and `api-spec.md` matching all 11 required sections, Zen Green design system tokens, database schemas, and REST API contracts.

3. **Prompt 3 (Authorization Matrix & Test Plan DD)**:
   > *"เสร็จแล้วทำต่อได้เลยแต่ อย่าลืม สิ่งสำคัญที่ต้องตัดสินใจในเฟสนี้ (authorization matrix): Requester, IT Staff, Administrator..."*
   - **Result**: AI generated `tests.md` detailing the 5-layer test plan, authorization matrix, and 100% Acceptance Criteria traceability mapping (`AC-01` to `AC-12`).

---

## Reflection on AI Specification & Coding Agent Use ("My Reflection")

Using the AI agent during Phase 1 (Engineering Contract & Specification DD) significantly sped up the formalization of system requirements, business rules, and API contracts. By explicitly defining the authorization boundaries (Requester, IT Staff, Administrator) before touching implementation code, we ensured that server-side security checks (401/403) and business rules (e.g. self-deactivation prevention) are baked into the design contract first.

Dividing the deliverables into sub-tasks and manually committing each sub-task allowed us to maintain a clean, multi-commit git history on feature branches before merging into `lab3-staging` and `main`.
