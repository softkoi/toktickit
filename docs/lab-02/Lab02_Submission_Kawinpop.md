# CPE 334 Introduction to Software Engineering in the Age of AI Agents
## Lab 2. TokTickIT Requester Ticketing MVP with UI Foundation

**Name:** Kawinpop [ระบูนามสกุลที่นี่ / Last Name]  
**Student ID:** [ระบูนามสกุล/รหัสนักศึกษาที่นี่ / e.g. 6707050XXXX]  

---

## 1. Git Use with Engineering Workflow

### 1.1 Repository & Project URLs

| Item | URL |
|---|---|
| **GitHub Repository** | https://github.com/softkoi/toktickit |
| **GitHub Project Board** | https://github.com/users/softkoi/projects/1 |
| **Issue 1: Sprint Specification and Test Plan** | https://github.com/softkoi/toktickit/issues/[ระบุหมายเลข Issue] |
| **Issue 2: Database Setup and Development Requester Context** | https://github.com/softkoi/toktickit/issues/[ระบุหมายเลข Issue] |
| **Issue 3: Implement Ticket Creation System** | https://github.com/softkoi/toktickit/issues/[ระบุหมายเลข Issue] |
| **Issue 4: Implement File Attachment Upload & Validation** | https://github.com/softkoi/toktickit/issues/[ระบุหมายเลข Issue] |
| **Issue 5: Implement My Tickets Dashboard** | https://github.com/softkoi/toktickit/issues/[ระบุหมายเลข Issue] |
| **Issue 6: Ticket Details and Attachment Lifecycle** | https://github.com/softkoi/toktickit/issues/[ระบุหมายเลข Issue] |
| **PR 1 — feature/1-specification** | https://github.com/softkoi/toktickit/pull/10 |
| **PR 2 — feature/2-requester-context** | https://github.com/softkoi/toktickit/pull/11 |
| **PR 3 — feature/3-create-ticket** | https://github.com/softkoi/toktickit/pull/12 |
| **PR 4 — feature/4-file-attachment** | https://github.com/softkoi/toktickit/pull/13 |
| **PR 5 — feature/5-my-tickets** | https://github.com/softkoi/toktickit/pull/14 |
| **PR 6 — feature/6-ticket-detail** | https://github.com/softkoi/toktickit/pull/15 |

---

### 1.2 Branch & Commit Workflow

| Branch | Flow |
|---|---|
| **main** | stable release branch; only receives merges from lab2-staging |
| **lab2-staging** | Lab 2 integration branch; all feature PRs target this branch |
| **feature/1-specification** | merged into lab2-staging via PR #10 |
| **feature/2-requester-context** | merged into lab2-staging via PR #11 |
| **feature/3-create-ticket** | merged into lab2-staging via PR #12 |
| **feature/4-file-attachment** | merged into lab2-staging via PR #13 |
| **feature/5-my-tickets** | merged into lab2-staging via PR #14 |
| **feature/6-ticket-detail** | merged into lab2-staging via PR #15 |

---

### 1.3 Project Evidence

| Item | Screenshot |
|---|---|
| **Kanban Board** | *(วางรูป Screenshot หน้า Kanban Board ที่นี่)* |
| **Commit History** | *(วางรูป Screenshot หน้า Commit History ที่นี่)* |
| **Directory Structure** | *(วางรูป Screenshot หน้า Directory Structure ใน VS Code ที่นี่)* |
| **README.md** | *(วางรูป Screenshot หน้า README.md ที่นี่)* |
| **reviewer.md** | *(วางรูป Screenshot หน้า reviewer.md ที่นี่)* |

---

### 1.4 PR Review Evidence

#### 1.4.1 Pull Requests Reviewed (PR ของเราที่ผ่านการ Review)

##### 1.4.1.1 PR 1 — feature/1-specification → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | #10 (https://github.com/softkoi/toktickit/pull/10) |
| **Reviewer** | Benjamin DG (@bbxndg) |
| **Review Comment** | Complete .md information is ready to work on the next step. |
| **My Response** | Thank you for review Benjamin. |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐาน PR #10 ที่นี่)* |

##### 1.4.1.2 PR 2 — feature/2-requester-context → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | #11 (https://github.com/softkoi/toktickit/pull/11) |
| **Reviewer** | Benjamin DG (@bbxndg) |
| **Review Comment (1)** | In schema.prisma under the Attachment model, check the relation cascade options. |
| **My Response (1)** | Thanks for pointing this out. Verified and handled accordingly for audit trail safety. |
| **Review Comment (2)** | Everything looks good and ready to merge. |
| **My Response (2)** | Thank you for review. Proceeding to merge. |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐาน PR #11 ที่นี่)* |

##### 1.4.1.3 PR 3 — feature/3-create-ticket → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | #12 (https://github.com/softkoi/toktickit/pull/12) |
| **Reviewer** | Benjamin DG (@bbxndg) |
| **Review Comment** | Detailed tests and ticket creation logic look complete. |
| **My Response** | Thank you for the review! |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐาน PR #12 ที่นี่)* |

##### 1.4.1.4 PR 4 — feature/4-file-attachment → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | #13 (https://github.com/softkoi/toktickit/pull/13) |
| **Reviewer** | Benjamin DG (@bbxndg) |
| **Review Comment** | Attachment uploader and validation endpoints look good. |
| **My Response** | Thanks Benjamin! |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐาน PR #13 ที่นี่)* |

##### 1.4.1.5 PR 5 — feature/5-my-tickets → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | #14 (https://github.com/softkoi/toktickit/pull/14) |
| **Reviewer** | Benjamin DG (@bbxndg) |
| **Review Comment** | Search, filter, sorting, and pagination logic tested and verified. |
| **My Response** | Thank you for the detailed review. |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐาน PR #14 ที่นี่)* |

##### 1.4.1.6 PR 6 — feature/6-ticket-detail → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | #15 (https://github.com/softkoi/toktickit/pull/15) |
| **Reviewer** | Benjamin DG (@bbxndg) |
| **Review Comment** | Ticket detail page, attachment download, and soft removal confirmed working. |
| **My Response** | Thank you for the review and approval! |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐาน PR #15 ที่นี่)* |

---

#### 1.4.2 Pull Requests I Reviewed for My Partner (PR ของเพื่อนที่เราไปช่วย Review)

##### 1.4.2.1 PR A — [ระบุชื่อ Feature Branch ของเพื่อน] → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | https://github.com/bbxndg/toktickit/pull/[ระบุหมายเลข PR] |
| **My Review Comment** | Everything is complete and matches the specification. |
| **Partner's Response** | Thank you for the review, ready to merge. |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐานการ Review PR ของเพื่อนที่นี่)* |

##### 1.4.2.2 PR B — [ระบุชื่อ Feature Branch ของเพื่อน] → lab2-staging

| Field | Detail |
|---|---|
| **PR Link** | https://github.com/bbxndg/toktickit/pull/[ระบุหมายเลข PR] |
| **My Review Comment** | Verified test cases and UI flow, great job! |
| **Partner's Response** | Thanks Kawinpop, merging now. |
| **Outcome** | Approved and merged |
| **PR Review Evidence** | *(วางรูป Screenshot หลักฐานการ Review PR ของเพื่อนที่นี่)* |

---

## 2. Spec DD (specification.md)

| Item | Screenshot |
|---|---|
| **specification.md (Part 1: Sprint Goal & Scope)** | *(วางรูป Screenshot เอกสาร specification.md ส่วนที่ 1 ที่นี่)* |
| **specification.md (Part 2: Functional Requirements)** | *(วางรูป Screenshot เอกสาร specification.md ส่วนที่ 2 ที่นี่)* |
| **specification.md (Part 3: Business Rules)** | *(วางรูป Screenshot เอกสาร specification.md ส่วนที่ 3 ที่นี่)* |
| **specification.md (Part 4: Data Models & Schema)** | *(วางรูป Screenshot เอกสาร specification.md ส่วนที่ 4 ที่นี่)* |
| **specification.md (Part 5: Acceptance Criteria & DoD)** | *(วางรูป Screenshot เอกสาร specification.md ส่วนที่ 5 ที่นี่)* |

---

## 3. Tests DD and Traceability (tests.md)

| Item | Screenshot |
|---|---|
| **tests.md (Part 1: Test Strategy & Levels)** | *(วางรูป Screenshot เอกสาร tests.md ส่วนที่ 1 ที่นี่)* |
| **tests.md (Part 2: Unit & Integration Matrix)** | *(วางรูป Screenshot เอกสาร tests.md ส่วนที่ 2 ที่นี่)* |
| **tests.md (Part 3: UI & E2E Test Matrix)** | *(วางรูป Screenshot เอกสาร tests.md ส่วนที่ 3 ที่นี่)* |
| **tests.md (Part 4: Acceptance Criteria Traceability)** | *(วางรูป Screenshot เอกสาร tests.md ส่วนที่ 4 ที่นี่)* |
| **tests.md (Part 5: Execution Commands & Pass Status)** | *(วางรูป Screenshot เอกสาร tests.md ส่วนที่ 5 ที่นี่)* |

---

## 4. AI Use and Reflection (ai_use.md)

### 4.1 Selected Key Prompts & Reflection

| # | Prompt Name | Actual Prompt Text | My Reflection |
|---|---|---|---|
| 1 | **การสรุป Requirements และออกแบบ Sprint** | ช่วยสรุป requirements ทั้งหมดของ Lab 2 จากไฟล์ spec และแบ่งงานออกเป็น User Stories สำหรับ GitHub Project Board | AI สรุปข้อมูลและแยกแยะงานได้ละเอียด ช่วยให้วางแผนและสร้าง Issue ใน Project Board ได้อย่างมีรหัสโครงสร้างชัดเจน |
| 2 | **การออกแบบ Database Schema** | ช่วยออกแบบ Prisma Schema สำหรับระบบ Lab 2 โดยรองรับ Requester, Ticket, Attachment, Category และ Related System | AI แนะนำ Audit fields (`createdAt`, `updatedAt`) และการทำ Soft delete (`removedAt`) ช่วยรักษา Audit trail ตาม Best Practices |
| 3 | **การสร้าง Ticket Number Sequence** | อยากได้รหัส Ticket รูปแบบ `TKT-YYYY-XXXXXX` ที่รันแบบ อัตโนมัติและไม่ซ้ำกันตามปี ค.ศ. ปัจจุบัน | AI ออกแบบ Utility generator พร้อมแนบ Unit tests ครอบคลุม Edge cases สำหรับ Tie-breaker ลำดับเวลา |
| 4 | **การแก้ปัญหา Sorting & Pagination** | แก้ปัญหา sorting ใน GET `/api/tickets` เมื่อ createdAt มีค่าเท่ากันแล้ว pagination หลุด | AI แนะนำการใส่ `ticketNumber DESC` เป็น Secondary sort (Tie-breaker) ทำให้การแบ่งหน้ามีความเสถียร 100% |
| 5 | **ระบบ Attachment & Soft Delete** | ช่วยออกแบบการ Soft-remove ไฟล์แนบพร้อมบังคับระบุเหตุผลในการลบอย่างน้อย 5 ตัวอักษร | AI ช่วยวางโครงสร้าง API, Audit metadata (`removalReason`, `removedByRequesterId`) และ validation error handling |
| 6 | **การทำ Responsive Navbar** | ตัว Navbar บนมือถือมีไอคอน hamburger เมื่อกดแล้วเปิดแผง Drawer เมนู | AI ช่วยปรับแต่ง Tailwind CSS และ React Component state ให้รองรับทั้ง Mobile, Tablet, Desktop อย่างสวยงาม |
| 7 | **ความแตกต่างระหว่าง Vitest กับ Playwright** | อยากรู้ว่า test ตัวไหนใช้ทดสอบหน้าบ้าน และตัวไหนทดสอบ E2E flow | AI อธิบายความแตกต่างอย่างชัดเจน Vitest ใช้เทส Component/Unit ส่วน Playwright ใช้เทส Browser E2E จริง |
| 8 | **การเขียน E2E Test ด้วย Playwright** | ช่วยเขียน E2E Test ครอบคลุม flow การสลับ Requester -> สร้างตั๋ว -> อัปโหลดไฟล์ -> กรองตั๋ว | AI เจนชุดทดสอบ Playwright ได้ถูกต้อง ตรวจสอบองค์ประกอบบนหน้าจอได้ครบถ้วน และรองรับการทำ assertion สิทธิ์ 403 Forbidden |

### 4.2 Overall Reflection

ในการทำงาน Lab 2 นี้ ได้ใช้ **Antigravity AI Coding Agent** (ร่วมกับ Google Cloud Platform / Claude 4.6 & Gemini 3.6 Flash) ในการช่วยออกแบบ Data Model, ตรวจสอบ Business Logic, เขียน unit test, API integration test และ E2E test ด้วย Playwright รวมถึงการปรับแต่ง UI หน้าตา Zen Green Theme 

การทำงานร่วมกับ AI Agent ช่วยลดเวลาในการสร้าง Boilerplate code และชุดทดสอบลงได้มาก ทำให้สามารถโฟกัสที่การออกแบบสถาปัตยกรรมระบบ ความปลอดภัยของสิทธิ์การเข้าถึงข้อมูล (Ownership Enforcement) และความถูกต้องของกระบวนการวิศวกรรมซอฟต์แวร์ได้อย่างสมบูรณ์

---

## 5. Development Requester Select Screen

| Screen | Screenshot |
|---|---|
| **Requester Select Screen (not selected)** | *(วางรูป Screenshot หน้าเลือก Requester ตอนยังไม่ได้เลือกตัวตน)* |
| **Requester Select Screen (selected)** | *(วางรูป Screenshot หน้าเลือก Requester ตอนเลือกตัวตน Kawinpop / Active Requester แล้ว)* |

---

## 6. Working Ticket Screen: Create Mode

| Screen | Screenshot |
|---|---|
| **Working Ticket Screen: Form View** | *(วางรูป Screenshot ฟอร์มสร้างตั๋วแบบปกติ)* |
| **Working Ticket Screen: Validation Invalid** | *(วางรูป Screenshot ฟอร์มเมื่อกรอกข้อมูลไม่ครบหรือสั้นเกินไป แสดง error message)* |
| **Working Ticket Screen: Invalid File Upload** | *(วางรูป Screenshot ตอนอัปโหลดไฟล์ขนาดเกิน 5MB หรือประเภทไฟล์ไม่ถูกต้อง)* |
| **Working Ticket Screen: Safe Error State** | *(วางรูป Screenshot การจัดการ Error กรณี Backend ตอบสนองล้มเหลว)* |

---

## 7. Working My Tickets Screen

| Screen | Screenshot |
|---|---|
| **Working My Tickets Screen (Desktop)** | *(วางรูป Screenshot หน้าแสดงรายการตั๋ว ตาราง Data Table บน Desktop)* |
| **Working My Tickets Screen (Filter / Search)** | *(วางรูป Screenshot หน้าตารางตั๋วเมื่อค้นหาคีย์เวิร์ดหรือกรองหมวดหมู่)* |

---

## 8. Working Ticket Screen: View Mode and Attachments

| Screen | Screenshot |
|---|---|
| **View Mode and Attachments (Active Files)** | *(วางรูป Screenshot หน้ารายละเอียดตั๋ว แสดงรายการไฟล์แนบที่ active พร้อมปุ่มดาวน์โหลด)* |
| **View Mode and Attachments (Soft Removed)** | *(วางรูป Screenshot หน้ารายละเอียดตั๋ว แสดงไฟล์แนบที่ถูก Soft-removed พร้อมเหตุผลการลบ)* |

---

## 9. Zen Green UI and Responsive Evidence

| Screen | Screenshot |
|---|---|
| **Mobile View (<768px)** | *(วางรูป Screenshot หน้าจอ Mobile Card Layout)* |
| **Mobile Navigation Bar (Drawer Open)** | *(วางรูป Screenshot แถบเมนู Navigation Bar บน Mobile ตอนเปิด Drawer)* |
| **Tablet View (768px - 991px)** | *(วางรูป Screenshot หน้าจอ Tablet Responsive Layout)* |
| **Desktop View (≥992px)** | *(วางรูป Screenshot หน้าจอ Desktop Full Layout)* |
