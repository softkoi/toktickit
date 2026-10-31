# TokTickIT — Lab 4 (Sprint 4)

## Overview: Actions Taken, Ticket Workflow, Resolution Gate & Role-Based Dashboards

This directory contains the engineering contracts, architecture designs, quality assurance plans, and evaluation records for **Lab 4 (Sprint 4)** of the TokTickIT service desk application.

---

## Lab 4 Core Deliverables & Documentation

1. **[specification.md](./specification.md)**:
   - Full Sprint 4 Engineering Contract
   - Actions Taken parent-child schema under Ticket
   - Strict Ticket Workflow state transition graph (`NEW` -> `OPEN` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`)
   - Resolution Gate rules (`BR-01` to `BR-05`)
   - Acceptance Criteria (`AC-01` to `AC-06`)

2. **[api-spec.md](./api-spec.md)**:
   - Actions Taken REST APIs (`GET`, `POST`, `PUT`)
   - Status transition and Resolution Gate enforcement endpoints (`PATCH /api/tickets/:id/status`)
   - Role-Based Dashboard endpoints (`GET /api/dashboard/requester`, `GET /api/dashboard/staff`)
   - Stale update detection & optimistic concurrency handling (`409 Conflict`)

3. **[ui-spec.md](./ui-spec.md)**:
   - Requester Dashboard with quick action logging & submission cards
   - IT Staff & Admin Dashboard with 5-column operational queue metrics & priority badges
   - Actions Taken timeline UI on Ticket Detail view
   - Zen Green color tokens, accessible focus indicators, and responsive breakpoints

4. **[tests.md](./tests.md)**:
   - Master Test Plan & Traceability Matrix
   - 5 testing layers: Unit, API Integration, UI Component, Concurrency/Security, and E2E Flow
   - 100% Acceptance Criteria traceability (`AC-01` to `AC-06`)

5. **[reviewer.md](./reviewer.md)**:
   - Peer review verification checklist
   - Pull Request change log and reviewer feedback resolutions (PRs #30, #31, #32, #33, #34)

6. **[ai-use.md](./ai-use.md)**:
   - AI Pair Programming interaction log
   - Prompt iteration records and reflections on Spec DD and Test DD

---

## Lab 4 Feature Breakdown & PR Links

| Issue | Feature Description | PR Branch | Pull Request |
|---|---|---|---|
| **#35** | Sprint 4 Engineering Contract & Specification | `docs/sprint4-spec` | [PR #30](https://github.com/softkoi/toktickit/pull/30) |
| **#36** | Actions Taken Backend Foundation & APIs | `feat/actions-taken-backend` | [PR #31](https://github.com/softkoi/toktickit/pull/31) |
| **#37** | Actions Taken UI Component on Ticket Detail | `feat/actions-taken-frontend` | [PR #32](https://github.com/softkoi/toktickit/pull/32) |
| **#38** | Strict Ticket Workflow & Resolution Gate | `feat/ticket-workflow-resolution` | [PR #33](https://github.com/softkoi/toktickit/pull/33) |
| **#39** | Role-Based Dashboards & Final Application Hardening | `feat/dashboards-and-hardening` | [PR #34](https://github.com/softkoi/toktickit/pull/34) |
