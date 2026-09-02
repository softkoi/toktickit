# Lab 2 — เอกสารแผนการทดสอบและตารางสรุปการทดสอบ (Master Test Plan & Test Matrix)

> **สถานะ:** เอกสารแผนการทดสอบระบบ (System Test Plan & Quality Assurance Strategy)  
> **กลุ่มเป้าหมาย:** QA Engineer / Backend & Frontend Developers / AI Coding Agent  
> **วัตถุประสงค์:** กำหนดแผนการทดสอบระบบ TokTickIT ใน Lab 2 ครอบคลุมทุกระดับการทดสอบ (Unit, API Integration, UI Component, Responsive Layout, E2E) เพื่อการันตีว่าทุกเกณฑ์การตรวจรับงาน (Acceptance Criteria: `AC-01` ถึง `AC-15`) มีการทดสอบองรับครบ 100%

---

## 1. ภาพรวมกลยุทธ์การทดสอบ (Test Strategy & Tooling)

การทดสอบในระบบ TokTickIT ใน Lab 2 ถูกแบ่งออกเป็น 5 ระดับชั้น (Test Layers) เพื่อสร้างความมั่นใจในคุณภาพทั้งฝั่ง Server และ Client:

```
                  ┌───────────────────────────────┐
                  │       E2E Flow Tests          │ (Playwright)
                  ├───────────────────────────────┤
                  │   Responsive Layout Tests     │ (Playwright Visual)
                  ├───────────────────────────────┤
                  │     UI Component Tests        │ (Vitest / React Testing Library)
                  ├───────────────────────────────┤
                  │    API Integration Tests      │ (Supertest / Vitest)
                  ├───────────────────────────────┤
                  │       Unit Service Tests      │ (Vitest / Jest)
                  └───────────────────────────────┘
```

- **Unit Testing:** ทดสอบ Business Logic บริสุทธิ์ เช่น การออกเลข `ticketNumber`, การ Validate สายอักขระ, การคำนวณโควตาไฟล์
- **API Integration Testing:** ทดสอบ HTTP Request/Response, Validation Rules, HTTP Error Codes (400, 403, 404, 409, 413, 415, 500) และ Ownership Control (BR-24)
- **UI Component Testing:** ทดสอบ Form Input States (editable, focus, error, read-only, disabled), Button Hierarchy และ Loading spinners
- **Responsive Layout Testing:** ทดสอบการแสดงผลบน Desktop (≥992px), Tablet (768-991px) และ Mobile (<768px) รวมถึงการแปลง Data Table เป็น Stacked Cards
- **End-to-End (E2E) Testing:** ทดสอบ User Flow ตั้งแต่สลับ Requester → สร้างตั๋ว → อัปโหลดไฟล์ → กรองตั๋ว → ดูรายละเอียด → Soft-remove ไฟล์แนบ

---

## 2. ตารางแผนการทดสอบหลัก (Master Test Matrix)

> **ข้อกำหนดการครอบคลุม:** ทุก Acceptance Criteria (`AC-01` ถึง `AC-15`) จาก `specification.md` มีอย่างน้อย 1 กรณีทดสอบจับคู่ไว้โดยสมบูรณ์

| Test ID | Type | AC ที่ผูก | สิ่งที่เทส (Test Description) | ผลที่คาดหวัง (Expected Outcome) | path ไฟล์เทสต์จริง | สถานะ |
|---|---|---|---|---|---|---|
| `TEST-001` | **UI** | `AC-01` | การสลับเปลี่ยนตัวตน Requester ในส่วน Requester Switcher | เปลี่ยน Requester ปัจจุบันสำเร็จ และบันทึก `X-Requester-Id` ลงใน Client State | `client/tests/components/RequesterSwitcher.test.tsx` | **Pass** |
| `TEST-002` | **API** | `AC-01` | แนบ Header `X-Requester-Id` ส่งไปยัง API Endpoints | API รับค่า Header และดึงข้อมูลของ Requester คนนั้นถูกต้อง | `server/tests/api/requesters.api.test.ts` | **Pass** |
| `TEST-003` | **API** | `AC-02` | สร้าง Ticket ใหม่ด้วยข้อมูลที่ถูกต้อง (`POST /api/tickets`) | ตอบ `201 Created` ได้รับ `ticketNumber` รูปแบบ `TKT-2026-XXXXXX` และ `currentStatus = "NEW"` | `server/tests/api/tickets.create.api.test.ts` | **Pass** |
| `TEST-004` | **Unit** | `AC-02` | ฟังก์ชันออกรหัส Ticket Number อัตโนมัติใน Backend | สร้างรหัสไม่ซ้ำในรูปแบบ `TKT-YYYY-XXXXXX` ด้วยรันนิงเลขออโต้ 6 หลัก | `server/tests/unit/ticket-number.generator.test.ts` | **Pass** |
| `TEST-005` | **API** | `AC-03` | ส่งข้อมูลสร้าง Ticket ที่ไม่สมบูรณ์ หรือ `summary` สั้นเกิน 5 ตัวอักษร | ตอบ `400 Bad Request` พร้อม `code: "VALIDATION_ERROR"` และระบุฟิลด์ที่ผิดพลาดใน `fields` | `server/tests/api/tickets.create.validation.test.ts` | **Pass** |
| `TEST-006` | **UI** | `AC-03` | กรอกข้อมูลในหน้าฟอร์มสร้างตั๋วผิดกติกาแล้วกด Submit | ฟอร์มแสดง Red Error Border, Focus ring สีแดง และข้อความ error ด้านล่างฟิลด์ | `client/tests/components/TicketForm.test.tsx` | **Pass** |
| `TEST-007` | **API** | `AC-04` | อัปโหลดไฟล์แนบประเภท JPEG, PNG, WEBP, PDF ขนาด ≤5MB (`POST /api/tickets/:id/attachments`) | ตอบ `201 Created` พร้อมเมทาดาทาไฟล์แนบ และ `isRemoved = false` | `server/tests/api/attachments.upload.test.ts` | **Pass** |
| `TEST-008` | **API** | `AC-05` | อัปโหลดไฟล์แนบที่มีขนาดใหญ่เกิน 5MB (5,242,881 bytes) | ตอบ `413 Payload Too Large` พร้อม `code: "FILE_TOO_LARGE"` และไม่บันทึกไฟล์ลงดิสก์ | `server/tests/api/attachments.validation.test.ts` | **Pass** |
| `TEST-009` | **API** | `AC-05` | อัปโหลดไฟล์แนบประเภทที่ไม่รองรับ (เช่น `.exe`, `.zip`, `.txt`) | ตอบ `415 Unsupported Media Type` พร้อม `code: "UNSUPPORTED_FILE_TYPE"` | `server/tests/api/attachments.validation.test.ts` | **Pass** |
| `TEST-010` | **API** | `AC-06` | อัปโหลดไฟล์แนบเข้า Ticket เดิมที่เดิมมี Active Attachments ครบ 5 ไฟล์แล้ว | ตอบ `409 Conflict` พร้อม `code: "ATTACHMENT_LIMIT_REACHED"` | `server/tests/api/attachments.quota.test.ts` | **Pass** |
| `TEST-011` | **Unit** | `AC-06` | ฟังก์ชันนับจำนวน Active Attachments (`isRemoved = false`) | คืนค่าจำนวนไฟล์ active อย่างถูกต้อง โดยไม่นับรวมไฟล์ที่ถูก Soft-remove ไปแล้ว | `server/tests/unit/attachment.service.test.ts` | **Pass** |
| `TEST-012` | **API** | `AC-07` | ดึงรายการตั๋ว (`GET /api/tickets`) ด้วย Header `X-Requester-Id: 1` | รายการตั๋วที่ส่งกลับมีเฉพาะตั๋วที่มี `requesterId = 1` เท่านั้น | `server/tests/api/tickets.list.api.test.ts` | **Pass** |
| `TEST-013` | **API** | `AC-08` | ค้นหาตั๋วด้วยคีย์เวิร์ด (`GET /api/tickets?search=battery`) | คืนรายการตั๋วที่ `summary` หรือ `ticketNumber` มีคำว่า "battery" แบบ Case-insensitive | `server/tests/api/tickets.search.api.test.ts` | **Pass** |
| `TEST-014` | **API** | `AC-09` | กรองตั๋วด้วยเงื่อนไขหลายตัวร่วมกัน (`category=2&requestedPriority=HIGH&status=NEW`) | กรองรายการด้วย AND Logic คืนเฉพาะตั๋วที่ตรงตามทุกเงื่อนไขพร้อมกัน | `server/tests/api/tickets.filter.api.test.ts` | **Pass** |
| `TEST-015` | **API** | `AC-10` | ดึงรายการตั๋วแบบแบ่งหน้า (`GET /api/tickets?page=2&pageSize=10`) | คืนรายการตั๋วหน้าที่ 2 จำนวน 10 รายการ พร้อม `meta: { page: 2, pageSize: 10, totalItems, totalPages }` | `server/tests/api/tickets.pagination.api.test.ts` | **Pass** |
| `TEST-016` | **UI** | `AC-10` | เลือกเปลี่ยน Pagination Page Size บน UI (10, 20, 50) | ตารางโหลดข้อมูลใหม่และปรับจำนวนแถวตาม Page Size ที่เลือก | `client/tests/components/Pagination.test.tsx` | **Pass** |
| `TEST-017` | **API** | `AC-11` | ดึงรายละเอียดตั๋วใบเดียว (`GET /api/tickets/:id`) | ตอบ `200 OK` คืนข้อมูลตั๋วฉบับเต็มและ Array `attachments` ทั้งไฟล์ active และ soft-removed | `server/tests/api/tickets.detail.api.test.ts` | **Pass** |
| `TEST-018` | **UI** | `AC-11` | ดูรายละเอียดตั๋วในหน้า Ticket Detail View | แสดง Summary, Description, Badges และรายการไฟล์แนบ active/removed ถูกต้อง | `client/tests/components/TicketDetail.test.tsx` | **Pass** |
| `TEST-019` | **API** | `AC-12` | ดาวน์โหลดไฟล์แนบดิบที่ยัง Active (`GET /api/attachments/:id/download`) | ตอบ `200 OK` พร้อม Binary Content, `Content-Type` และ `Content-Disposition` Header ถูกต้อง | `server/tests/api/attachments.download.test.ts` | **Pass** |
| `TEST-020` | **API** | `AC-13` | ทำ Soft-remove ไฟล์แนบพร้อมกรอกเหตุผล (`PATCH /api/attachments/:id/remove`) | ตอบ `200 OK` อัปเดต `isRemoved = true`, บันทึก `removedAt` และ `removalReason` | `server/tests/api/attachments.remove.test.ts` | **Pass** |
| `TEST-021` | **API** | `AC-13` | ทำ Soft-remove ไฟล์แนบโดยกรอกเหตุผลสั้นกว่า 5 ตัวอักษร | ตอบ `400 Bad Request` พร้อม `code: "VALIDATION_ERROR"` และไม่ทำการซ่อนไฟล์ | `server/tests/api/attachments.remove.validation.test.ts` | **Pass** |
| `TEST-022` | **API** | `AC-14` | ดาวน์โหลดไฟล์แนบที่ถูก Soft-remove ไปแล้ว (`isRemoved = true`) | ตอบ `409 Conflict` พร้อม `code: "ATTACHMENT_REMOVED"` และไม่อนุญาตให้ดาวน์โหลด | `server/tests/api/attachments.download.removed.test.ts` | **Pass** |
| `TEST-023` | **API** | `AC-14` | ทำ Soft-remove ซ้ำบนไฟล์แนบที่ถูกลบไปแล้วก่อนหน้า | ตอบ `409 Conflict` พร้อม `code: "ALREADY_REMOVED"` | `server/tests/api/attachments.remove.duplicate.test.ts` | **Pass** |
| `TEST-024` | **API** | `AC-15` | เข้าถึง Ticket ของ Requester คนอื่น (`GET /api/tickets/:id` ด้วย `X-Requester-Id` ผิด) | ตอบ `403 Forbidden` พร้อม `code: "FORBIDDEN"` (ไม่ leak ตอบ 404 ตาม BR-24) | `server/tests/api/ownership.ticket.test.ts` | **Pass** |
| `TEST-025` | **API** | `AC-15` | เข้าถึงหรือดาวน์โหลด Attachment ของ Requester คนอื่น | ตอบ `403 Forbidden` พร้อม `code: "FORBIDDEN"` | `server/tests/api/ownership.attachment.test.ts` | **Pass** |
| `TEST-026` | **Responsive** | `AC-07`, `AC-10` | ทดสอบหน้า My Tickets List บน Viewport ขนาด Mobile (<768px) | ตาราง Data Table แปลงเป็น **Stacked Cards Layout** และปุ่มขยายเป็น Full-width | `client/tests/responsive/tickets-list.mobile.spec.ts` | **Pass** |
| `TEST-027` | **Responsive** | `AC-03`, `AC-04` | ทดสอบหน้า Create Ticket บน Viewport ขนาด Tablet (768-991px) | ฟอร์มปรับจาก 2-Column เป็น 1-Column โดย Dropzone ย้ายไปอยู่ด้านล่างอย่างเป็นสัดส่วน | `client/tests/responsive/create-ticket.tablet.spec.ts` | **Pass** |
| `TEST-028` | **E2E** | `AC-01`-`AC-04` | End-to-End Flow: สลับ Requester → กรอกฟอร์มสร้างตั๋ว → อัปโหลดไฟล์ → ตรวจในรายการ | ดำเนินการสมบูรณ์ทุกขั้นตอน ตั๋วใหม่แสดงในรายการด้วยสถานะ `NEW` พร้อมไฟล์แนบ | `client/tests/e2e/ticket-creation-flow.spec.ts` | **Pass** |
| `TEST-029` | **E2E** | `AC-11`-`AC-14` | End-to-End Flow: ดูรายละเอียดตั๋ว → ดาวน์โหลดไฟล์ → Soft-remove ไฟล์พร้อมใส่เหตุผล | ดำเนินการสมบูรณ์ ไฟล์แนบเปลี่ยนเป็นสถานะ Soft-removed และปุ่มดาวน์โหลดปิดใช้งาน | `client/tests/e2e/attachment-lifecycle-flow.spec.ts` | **Pass** |

---

## 3. รายละเอียดโครงสร้างไฟล์ชุดทดสอบ (Test Directory Structure)

```
toktickit/
├── server/
│   └── tests/
│       ├── unit/
│       │   ├── ticket-number.generator.test.ts  # TEST-004
│       │   └── attachment.service.test.ts        # TEST-011
│       └── api/
│           ├── requesters.api.test.ts            # TEST-002
│           ├── tickets.create.api.test.ts        # TEST-003
│           ├── tickets.create.validation.test.ts # TEST-005
│           ├── tickets.list.api.test.ts          # TEST-012
│           ├── tickets.search.api.test.ts        # TEST-013
│           ├── tickets.filter.api.test.ts        # TEST-014
│           ├── tickets.pagination.api.test.ts    # TEST-015
│           ├── tickets.detail.api.test.ts        # TEST-017
│           ├── attachments.upload.test.ts        # TEST-007
│           ├── attachments.validation.test.ts    # TEST-008, TEST-009
│           ├── attachments.quota.test.ts         # TEST-010
│           ├── attachments.download.test.ts      # TEST-019
│           ├── attachments.remove.test.ts        # TEST-020, TEST-021
│           ├── attachments.download.removed.test.ts # TEST-022
│           ├── attachments.remove.duplicate.test.ts # TEST-023
│           ├── ownership.ticket.test.ts          # TEST-024
│           └── ownership.attachment.test.ts      # TEST-025
└── client/
    └── tests/
        ├── components/
        │   ├── RequesterSwitcher.test.tsx        # TEST-001
        │   ├── TicketForm.test.tsx               # TEST-006
        │   ├── Pagination.test.tsx               # TEST-016
        │   └── TicketDetail.test.tsx             # TEST-018
        ├── responsive/
        │   ├── tickets-list.mobile.spec.ts       # TEST-026
        │   └── create-ticket.tablet.spec.ts      # TEST-027
        └── e2e/
            ├── ticket-creation-flow.spec.ts      # TEST-028
            └── attachment-lifecycle-flow.spec.ts # TEST-029
```

---

## 4. คำสั่งสำหรับการรันชุดทดสอบ (Test Execution Commands)

นักศึกษาและ AI Coding Agent สามารถใช้คำสั่งต่อไปนี้รันการทดสอบระบบทั้งหมด:

### 4.1 รัน Backend Unit & API Integration Tests
```bash
# รัน Unit & API Integration Tests ทั้งหมดฝั่ง Server
cd server
npm test

# รันเฉพาะ API Integration Tests
npm run test:api

# รันเฉพาะ Ownership Enforcement Tests (BR-24)
npx vitest run tests/api/ownership.ticket.test.ts tests/api/ownership.attachment.test.ts
```

### 4.2 รัน Frontend Component & Responsive Tests
```bash
# รัน Frontend UI Component Tests
cd client
npm test

# รัน Responsive Layout Tests (Playwright)
npm run test:responsive
```

### 4.3 รัน End-to-End (E2E) Flow Tests
```bash
# รัน E2E Tests แบบ Headless Mode
npm run test:e2e

# รัน E2E Tests พร้อมเปิด UI Interactive Mode
npx playwright test --ui
```
