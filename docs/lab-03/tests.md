# Lab 3 — เอกสารแผนการทดสอบและตารางสรุปการทดสอบ (Master Test Plan & Test Matrix)

> **สถานะ:** เอกสารแผนการทดสอบระบบ (System Test Plan & Quality Assurance Strategy)  
> **กลุ่มเป้าหมาย:** QA Engineer / Backend & Frontend Developers / AI Coding Agent  
> **วัตถุประสงค์:** กำหนดแผนการทดสอบระบบ TokTickIT ใน Lab 3 ครอบคลุมทุกระดับการทดสอบ (Unit, API Integration, UI Component, Responsive Layout, E2E) เพื่อการันตีว่าทุกเกณฑ์การตรวจรับงาน (Acceptance Criteria: `AC-01` ถึง `AC-12`) และกฎทางธุรกิจ (Business Rules: `BR-01` ถึง `BR-15`) มีการทดสอบรองรับครบ 100%

---

## 1. ภาพรวมกลยุทธ์การทดสอบ (Test Strategy & Tooling)

การทดสอบในระบบ TokTickIT ใน Lab 3 ถูกแบ่งออกเป็น 5 ระดับชั้น (Test Layers) เพื่อสร้างความมั่นใจในสถาปัตยกรรมความปลอดภัย การยืนยันตัวตน (Authentication) การกำหนดสิทธิ์ตามบทบาท (Role-Based Authorization) และกระบวนการทำงานของ IT Staff และ Administrator:

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

### 1.1 ตารางสรุป Authorization Matrix ตามข้อกำหนดสิทธิ์ใน Lab 3
| บทบาท (Role) | สิทธิ์และการทำงานที่อนุญาต (Permitted Actions) | สิ่งที่ไม่อนุญาต (Forbidden Actions) |
| :--- | :--- | :--- |
| **Requester** | - เข้าถึงเฉพาะตั๋วและไฟล์แนบของตนเอง (`ownerId/requesterId`) <br>- สร้าง ตรวจดู และจัดการตั๋วของตนเอง <br>- เขียน Public Comment ได้ <br>- กดปุ่ม "Problem Appears Resolved" (แจ้งสถานะปัญหาคลี่คลาย) | - ห้ามเข้าถึงตั๋วของ Requester คนอื่น (`403 Forbidden`) <br>- ห้ามดูหรือเขียน Internal Note (`403 Forbidden`) <br>- ห้ามเปลี่ยนสถานะตั๋วเป็น `RESOLVED` หรือ `CLOSED` เองโดยตรง <br>- ห้ามเข้าถึง API / หน้า User Management (`403 Forbidden`) |
| **IT Staff** | - เข้าถึงและค้นหา IT Ticket Queue ทั้งหมด <br>- เปิดดูรายละเอียดตั๋ว กด Claim หรือ Reassign Owner ให้ IT Staff/Admin <br>- ปรับเปลี่ยน IT Priority และเปลี่ยนสถานะตั๋วตาม State Transition Matrix <br>- โพสต์ Public Comment และสร้าง Internal Note | - ห้ามเข้าถึง API / หน้า Administrator User Management (`403 Forbidden`) |
| **Administrator** | - จัดการบัญชีผู้ใช้ผ่านหน้า User Management เท่านั้น <br>- ดูรายการ ค้นหา กรองบทบาท สร้างผู้ใช้ใหม่ (กำหนด 1 Role และรหัสผ่านเริ่มต้น) <br>- แก้ไขข้อมูลผู้ใช้ สลับ Active/Inactive และ Reset รหัสผ่านเริ่มต้น | - โดย Default ไม่ยุ่งเกี่ยวกับการจัดการตั๋วการทำงานของ IT Staff (เว้นแต่จะได้รับสิทธิ์เฉพาะ) <br>- ห้ามปิดใช้งาน (Deactivate) บัญชีของตนเอง (`400 Bad Request`) <br>- ห้ามปิดใช้งาน Admin คนสุดท้ายของระบบ (`400 Bad Request`) |

---

## 2. ตารางแผนการทดสอบหลัก (Master Test Matrix)

> **ข้อกำหนดการครอบคลุม:** ทุก Acceptance Criteria (`AC-01` ถึง `AC-12`) จาก `specification.md` มีอย่างน้อย 1 กรณีทดสอบจับคู่ไว้โดยสมบูรณ์

| Test ID | Type | AC ที่ผูก | สิ่งที่เทส (Test Description) | ผลที่คาดหวัง (Expected Outcome) | path ไฟล์เทสต์จริง | สถานะ |
|---|---|---|---|---|---|---|
| `TEST-001` | **API** | `AC-01` | เข้าสู่ระบบด้วย Email และ Password ที่ถูกต้อง (`POST /api/auth/login`) | ตอบ `200 OK` ฝัง HTTP-only Session Cookie และคืนค่าข้อมูลโปรไฟล์พร้อมบทบาท (Role) | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| `TEST-002` | **API** | `AC-05` | เข้าสู่ระบบด้วยบัญชีผู้ใช้ที่ถูกปิดใช้งาน (`isActive = false`) | ตอบ `401 Unauthorized` พร้อมข้อความแจ้งเตือนความปลอดภัย โดยไม่ leak ข้อมูลบัญชี | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| `TEST-003` | **API** | `AC-01` | ออกจากระบบ (`POST /api/auth/logout`) | ตอบ `200 OK` ทำลาย Session บน Server และล้าง Cookie ออกจาก Browser | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| `TEST-004` | **E2E** | `AC-02` | บัญชีผู้ใช้ใหม่ที่มี `mustChangePassword = true` เข้าใช้งานระบบครั้งแรก | ระบบบังคับเปิดหน้าเปลี่ยนรหัสผ่าน และไม่อนุญาตให้เข้าหน้าปกติจนกว่าจะเปลี่ยนรหัสผ่านสำเร็จ | `e2e/lab-03/authentication.spec.ts` | **Pass** |
| `TEST-005` | **API** | `AC-02` | เปลี่ยนรหัสผ่านใหม่ผิดกติกาความปลอดภัย (สั้นกว่า 8 ตัว หรือขาดอักขระพิเศษ) | ตอบ `400 Bad Request` พร้อมแจ้งเงื่อนไขที่ยังไม่ผ่าน | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| `TEST-006` | **API** | `AC-03` | Requester พยายามเข้าถึงตั๋วของ Requester คนอื่นโดยระบุ `requesterId` อื่นใน Client | ตอบ `403 Forbidden` โดยระบบยึด identity จาก Session เท่านั้น | `server/tests/lab-03/authorization.api.test.ts` | **Pass** |
| `TEST-007` | **API** | `AC-04` | Requester เรียกขอข้อมูล หรือพยายามเขียน Internal Note (`GET/POST /api/staff/tickets/:id/notes`) | ตอบ `403 Forbidden` ไม่อนุญาตให้เข้าถึงหรือเห็นเนื้อหา Internal Note | `server/tests/lab-03/comments-notes.api.test.ts` | **Pass** |
| `TEST-008` | **API** | `AC-06` | IT Staff ดึงข้อมูล IT Ticket Queue พร้อมการค้นหาและกรองสถานะ/ความสำคัญ | ตอบ `200 OK` คืนรายการตั๋วทั้งหมดในระบบพร้อมข้อมูล Pagination | `server/tests/lab-03/staff-queue.api.test.ts` | **Pass** |
| `TEST-009` | **API** | `AC-07` | IT Staff ทำการ Claim ตั๋วที่ยังไม่มีเจ้าของ หรือ Reassign ตั๋วให้ IT Staff คนอื่น | ตอบ `200 OK` อัปเดต `ownerId` เป็นผู้ใช้งาน IT Staff/Admin ที่ระบุอย่างถูกต้อง | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| `TEST-010` | **API** | `AC-08` | IT Staff ปรับเปลี่ยนสถานะตั๋วที่ไม่ถูกต้องตาม State Transition Matrix (เช่น `NEW` -> `CLOSED`) | ตอบ `400 Bad Request` พร้อมปฏิเสธการเปลี่ยนสถานะตั๋ว | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| `TEST-011` | **API** | `AC-09` | Requester กดแจ้งปัญหาคลี่คลาย ("Problem Appears Resolved") | ตอบ `200 OK` ปรับสถานะเป็น `WAITING_FOR_REQUESTER` โดยไม่อนุญาตให้ปิดตั๋วถาวรเอง | `server/tests/lab-03/authorization.api.test.ts` | **Pass** |
| `TEST-012` | **API** | `AC-10` | Administrator พยายามปิดใช้งานบัญชี (Deactivate) ของตนเอง | ตอบ `400 Bad Request` พร้อมแจ้งข้อความห้าม Deactivate บัญชีตนเอง | `server/tests/lab-03/users-admin.api.test.ts` | **Pass** |
| `TEST-013` | **API** | `AC-11` | Administrator พยายามปิดใช้งาน หรือเปลี่ยนบทบาท Admin คนสุดท้ายในระบบ | ตอบ `400 Bad Request` พร้อมปฏิเสธการทำงานเพื่อป้องกันระบบขาด Admin | `server/tests/lab-03/users-admin.api.test.ts` | **Pass** |
| `TEST-014` | **API** | `AC-12` | ผู้ใช้บทบาท Requester หรือ IT Staff เรียกใช้ API จัดการผู้ใช้ (`/api/admin/*`) | ตอบ `403 Forbidden` ปฏิเสธการเข้าถึง endpoint สำหรับ Administrator | `server/tests/lab-03/authorization.api.test.ts` | **Pass** |
| `TEST-015` | **API** | `AC-12` | Administrator สร้างบัญชีผู้ใช้ใหม่ด้วย Email ที่มีอยู่ในระบบแล้ว | ตอบ `409 Conflict` พร้อมระบุว่า Email นี้ถูกใช้งานแล้ว | `server/tests/lab-03/users-admin.api.test.ts` | **Pass** |
| `TEST-016` | **UI** | `AC-01` | แสดงหน้าจอ Login และฟอร์มกรอกข้อมูลตามสไตล์ Zen Green | แสดงผล Input, Validation State และ Loading Spinner ได้ถูกต้อง | `client/src/components/lab-03/Login.test.tsx` | **Pass** |
| `TEST-017` | **UI** | `AC-06` | แสดงผลตาราง IT Ticket Queue บน Desktop และปรับเป็น Cards บน Mobile | แสดง Badges, Pagination และสลับการแสดงผลตาม Viewport ได้ถูกต้อง | `client/src/components/lab-03/StaffTicketQueue.test.tsx` | **Pass** |
| `TEST-018` | **UI** | `AC-07` | แสดงผลหน้า IT Staff Ticket Detail แยกแถบ Public Comment และ Internal Note ชัดเจน | แถบ Internal Note มีสีเตือน Amber พร้อมข้อความเตือนความปลอดภัย | `client/src/components/lab-03/StaffTicketDetail.test.tsx` | **Pass** |
| `TEST-019` | **UI** | `AC-10` | แสดงหน้าจอ Administrator User Management พร้อมค้นหาและ Modal สร้างผู้ใช้ | ปุ่ม Edit, Toggle Active และ Modal แสดงผลตามกฎ Zen Green | `client/src/components/lab-03/UserManagement.test.tsx` | **Pass** |
| `TEST-020` | **E2E** | `AC-06`-`AC-08`| End-to-End Flow: IT Staff เข้าสู่ระบบ → ค้นหาตั๋วใน Queue → เปิด Detail → Claim ตั๋ว → เขียน Internal Note → ปรับสถานะตั๋ว | ทำงานสำเร็จครบทุกขั้นตอนตามกระบวนการของ IT Staff | `e2e/lab-03/staff-ticket-flow.spec.ts` | **Pass** |
| `TEST-021` | **E2E** | `AC-10`-`AC-12`| End-to-End Flow: Admin เข้าสู่ระบบ → ค้นหาผู้ใช้ → สร้างผู้ใช้ใหม่ → สลับสิทธิ์ → Reset รหัสผ่าน | ทำงานสำเร็จครบทุกขั้นตอนตามกระบวนการของ Administrator | `e2e/lab-03/user-administration.spec.ts` | **Pass** |

---

## 3. รายละเอียดโครงสร้างไฟล์ชุดทดสอบ (Test Directory Structure)

```
toktickit/
├── server/
│   └── tests/
│       └── lab-03/
│           ├── auth.api.test.ts            # TEST-001, TEST-002, TEST-003, TEST-005
│           ├── authorization.api.test.ts   # TEST-006, TEST-011, TEST-014
│           ├── staff-queue.api.test.ts     # TEST-008
│           ├── staff-ticket-detail.api.test.ts # TEST-009, TEST-010
│           ├── comments-notes.api.test.ts  # TEST-007
│           └── users-admin.api.test.ts     # TEST-012, TEST-013, TEST-015
├── client/
│   └── src/
│       └── components/
│           └── lab-03/
│               ├── Login.test.tsx          # TEST-016
│               ├── ChangePassword.test.tsx # TEST-004 (UI)
│               ├── StaffTicketQueue.test.tsx # TEST-017
│               ├── StaffTicketDetail.test.tsx # TEST-018
│               └── UserManagement.test.tsx # TEST-019
└── e2e/
    └── lab-03/
        ├── authentication.spec.ts          # TEST-004
        ├── staff-ticket-flow.spec.ts       # TEST-020
        └── user-administration.spec.ts     # TEST-021
```
