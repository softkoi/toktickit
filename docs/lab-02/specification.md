# Lab 2 — เอกสารข้อกำหนดระบบ (Master Software Requirement Specification)

> **ภาพรวมระบบ:** เอกสารฉบับนี้กำหนดข้อกำหนดทางซอฟต์แวร์ กติกาทางธุรกิจ โครงสร้างข้อมูล และสถาปัตยกรรมอินเทอร์เฟซสำหรับระบบแจ้งซ่อมแซมและติดตามปัญหา IT (TokTickIT) ในส่วนของผู้ใช้งานแจ้งปัญหา (Requester) สำหรับ Lab 2 เพื่อให้ทีมพัฒนาและ AI Coding Agent สามารถนำไปออกแบบ ฐานข้อมูล API และ UI ได้อย่างถูกต้อง ตรงตามเป้าหมายขององค์กร

---

## 1. Sprint Goal

Requester สามารถสร้าง ดู ติดตาม และจัดการตั๋วแจ้งปัญหา (IT Support Ticket) พร้อมแนบไฟล์และค้นหาตั๋วของตนเองในระบบ TokTickIT ได้อย่างเต็มรูปแบบโดยสมบูรณ์

---

## 2. การตีความความต้องการของ Stakeholder (Stakeholder Request Interpretation)

องค์กรต้องการระบบศูนย์กลางสำหรับรับแจ้งปัญหาและคำขอใช้บริการด้าน IT จากพนักงาน (Requester) เพื่อทดแทนการแจ้งปัญหาผ่านช่องทางที่ไม่เป็นระบบ (เช่น อีเมลหรือแชตส่วนตัว) โดยในเฟสแรก (Lab 2) ระบบต้องเน้นการมอบคุณค่าให้แก่ฝั่งผู้แจ้งปัญหาเป็นหลัก เพื่อให้ Requester สามารถ:

1. **เลือกตัวตนทดสอบระบบ (Development Requester):** สลับตัวตนผู้ใช้ในการพัฒนาและทดสอบระบบได้สะดวกผ่าน Header พิเศษ (`X-Requester-Id`)
2. **สร้างตั๋วแจ้งปัญหาใหม่ (Create Ticket):** เลือกหมวดหมู่ปัญหา ระบบที่เกี่ยวข้อง กำดับความสำคัญ และกรอกรายละเอียด พร้อมแนบไฟล์ภาพหรือเอกสารประกอบเพื่อระบุปัญหาได้ชัดเจน
3. **ติดตามตั๋วของตนเอง (My Tickets):** ดูรายการตั๋วทั้งหมด ค้นหา กรองข้อมูลตามหมวดหมู่/ความสำคัญ/สถานะ และเรียงลำดับรายการได้อย่างสะดวกรวดเร็ว
4. **ดูรายละเอียดและจัดการไฟล์แนบ (Ticket Detail & Attachment Lifecycle):** ตรวจสอบรายละเอียดตั๋ว ดาวน์โหลดไฟล์แนบ และทำ Soft Removal ไฟล์แนบที่ไม่ต้องการพร้อมระบุเหตุผลได้
5. **ความปลอดภัยและกักกันข้อมูล (Data Isolation & Ownership):** ป้องกันไม่ให้ Requester คนหนึ่งแอบดู ดาวน์โหลด หรือแก้ไขตั๋วและไฟล์แนบของ Requester คนอื่นโดยเด็ดขาด

---

## 3. ขอบเขตงาน (Scope)

### 3.1 ขอบเขตที่นับรวมใน Lab 2 (Included Scope)

- **Development Requester Identity Switching:** การจำลองตัวตน Requester ผ่าน HTTP Header `X-Requester-Id`
- **Reference Data Services:** การดึงข้อมูลหมวดหมู่ (Category), ระบบที่เกี่ยวข้อง (Related System) และรายชื่อ Requester ที่ active
- **Ticket Creation Flow:** การสร้างตั๋วใหม่พร้อมตรวจสอบความถูกต้องของข้อมูล (Validation) การออกเลขตั๋วอัตโนมัติ (`TKT-YYYY-XXXXXX`) และการตั้งสถานะเริ่มต้นเป็น `"NEW"`
- **My Tickets View:** หน้าแสดงรายการตั๋วของ Requester ปัจจุบัน รองรับการค้นหา (Search), การกรอง (Filter), การเรียงลำดับ (Sort) และการแบ่งหน้า (Pagination)
- **Ticket Detail View:** หน้าแสดงรายละเอียดตั๋วฉบับเต็มและประวัติไฟล์แนบ
- **Attachment Lifecycle Management:** การอัปโหลดไฟล์แนบ (JPG, PNG, WEBP, PDF ขนาด ≤ 5MB สูงสุด 5 ไฟล์ active ต่อตั๋ว), การดาวน์โหลดไฟล์ดิบ และการทำ Soft Removal พร้อมระบุเหตุผล (`removalReason` ≥ 5 ตัวอักษร)
- **Strict Ownership Enforcement:** การตรวจสอบสิทธิ์การเข้าถึงทรัพยากรฝั่ง Backend (ตอบ 403 Forbidden เมื่อเข้าถึงของผู้อื่น และ 404 Not Found เมื่อไม่พบข้อมูลจริง)

### 3.2 ขอบเขตที่ไม่นับรวมใน Lab 2 (Excluded Scope)

- **Real Authentication & Authorization System:** ระบบ Login, Register, Password Hashing, JWT หรือ OAuth (จะทำใน Lab 3)
- **IT Staff Workflow & Admin Panel:** เวิร์กโฟลว์ของเจ้าหน้าที่ IT เช่น การรับตั๋ว (Assign), การเปลี่ยนสถานะตั๋วเป็น `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` หรือการจัดการคิวงาน
- **Comments & Discussion Threads:** การส่งข้อความโต้ตอบหรือการโน้ตภายในระหว่าง Requester กับ IT Staff
- **Notifications System:** การส่งอีเมลแจ้งเตือน, Push Notifications หรือ WebSocket Real-time Updates
- **Hard File Deletion / File Purging:** การลบไฟล์ดิบออกจากดิสก์แบบถาวร (ใน Lab 2 ใช้ Soft Removal เท่านั้น)

---

## 4. ข้อกำหนดเชิงฟีเจอร์ (Functional Requirements: FR-xx)

| ID | ชื่อฟีเจอร์ | คำอธิบายรายละเอียดฟีเจอร์ |
|---|---|---|
| **FR-01** | Development Identity Switcher | ระบบต้องมีกลไกให้ผู้ใช้เลือกตัวตน Development Requester ที่ active เพื่อแนบ Header `X-Requester-Id` ไปกับทุก Request ในระบบ |
| **FR-02** | Active Reference Data Loading | ระบบต้องดึงรายการ Active Categories, Active Related Systems และ Active Requesters มาแสดงในตัวเลือก Dropdown เรียงตามชื่อ A→Z |
| **FR-03** | Ticket Creation | Requester สามารถสร้างตั๋วใหม่โดยระบุ `categoryId`, `relatedSystemId`, `requestedPriority` (`LOW`/`MEDIUM`/`HIGH`), `summary` (5-200 ตัวอักษร) และ `description` (5-2000 ตัวอักษร) |
| **FR-04** | File Attachment Upload | Requester สามารถอัปโหลดไฟล์แนบ (JPG, PNG, WEBP, PDF ขนาด ≤5MB สูงสุด 5 ไฟล์ active) ประกอบตั๋วได้ทั้งระหว่างและหลังการสร้างตั๋ว |
| **FR-05** | My Tickets List | Requester สามารถดูรายการตั๋วทั้งหมดที่เป็นของตนเองได้ โดยแสดง Ticket Number, Summary, Category, Priority Badge, Status Badge และ วันที่สร้าง |
| **FR-06** | Ticket Search & Filter | Requester สามารถค้นหาตั๋วด้วยคีย์เวิร์ดใน `summary` หรือ `ticketNumber` และกรองรายการตาม `categoryId`, `requestedPriority` และ `currentStatus` ได้ |
| **FR-07** | Ticket Sorting & Pagination | Requester สามารถเลือกเรียงลำดับรายการตั๋ว (`ticketNumber`, `createdAt`, `updatedAt`) แบบ `asc`/`desc` และเลือกระบุจำนวนต่อหน้า (`10`, `20`, `50`) พร้อมเปลี่ยนหน้าได้ |
| **FR-08** | Ticket Detail View | Requester สามารถดูรายละเอียดฉบับเต็มของตั๋วของตนเอง รวมทั้งข้อมูลเมทาดาทา รายละเอียดปัญหา รายการไฟล์แนบ active และประวัติไฟล์แนบที่ถูก Soft-remove |
| **FR-09** | File Download | Requester สามารถดาวน์โหลดไฟล์แนบที่ยัง active (`isRemoved = false`) ของตนเองได้ |
| **FR-10** | Attachment Soft Removal | Requester สามารถทำการ Soft-remove ไฟล์แนบของตนเอง โดยระบุเหตุผลการลบ (`removalReason` อย่างน้อย 5 ตัวอักษร) ได้ |
| **FR-11** | Strict Ownership Control | ระบบ Backend ต้องตรวจสอบสิทธิ์ความยินยอมและเป็นเจ้าของทุกครั้งที่เข้าถึง Ticket หรือ Attachment เจาะจงตัว |

---

## 5. กติกาทางธุรกิจ (Business Rules: BR-xx)

| ID | กติกาทางธุรกิจ | คำอธิบายรายละเอียดกติกา |
|---|---|---|
| **BR-01** | Automatic Ticket Number | เลขตั๋ว (`ticketNumber`) ต้องสร้างขึ้นโดย Backend เสมอในรูปแบบ `TKT-YYYY-XXXXXX` (เช่น `TKT-2026-000042`) โดยใช้ปี ค.ศ. ปัจจุบัน และรันลำดับตัวเลข 6 หลักแบบ Unique ห้ามให้ Client ส่งมาเอง |
| **BR-02** | Initial Status Assignment | ตั๋วแจ้งปัญหาที่สร้างขึ้นใหม่ในระบบ Lab 2 จะต้องมีสถานะเริ่มต้นเป็น `currentStatus = "NEW"` เสมอ |
| **BR-03** | Active Data Restriction | ในการสร้างตั๋วใหม่ ข้อมูล `categoryId`, `relatedSystemId` และ `requesterId` ต้องเป็นรายการที่มีอยู่จริงในระบบและมีสถานะ `isActive = true` เท่านั้น |
| **BR-04** | Input String Validation | ข้อมูลป้อนเข้าต้องผ่านการตรวจสอบความถูกต้องดังนี้:<br>• `summary`: ความยาวหลัง trim ต้องอยู่ระหว่าง 5 ถึง 200 ตัวอักษร<br>• `description`: ความยาวหลัง trim ต้องอยู่ระหว่าง 5 ถึง 2000 ตัวอักษร<br>• `removalReason`: ความยาวหลัง trim ต้องไม่น้อยกว่า 5 ตัวอักษร |
| **BR-05** | Attachment Rules & Quota | การแนบไฟล์ต้องปฏิบัติตามกติกาดังนี้:<br>• ชนิดไฟล์ที่อนุญาต: `image/jpeg`, `image/png`, `image/webp`, `application/pdf` เท่านั้น<br>• ขนาดไฟล์สูงสุด: ไม่เกิน 5MB (5,242,880 bytes) ต่อ 1 ไฟล์<br>• โควตาต่อตั๋ว: ตั๋ว 1 ใบมี Active Attachments (`isRemoved = false`) ได้ไม่เกิน 5 ไฟล์ |
| **BR-06** | Attachment Resiliency | การอัปโหลดไฟล์แนบทำแยกจาก Endpoint สร้างตั๋ว หากสร้างตั๋วสำเร็จแต่อัปโหลดไฟล์แนบล้มเหลว ตั๋วเดิมยังคงอยู่ ไม่ถูก rollback (BR-17) |
| **BR-07** | Soft Removal & Download Constraint | ไฟล์แนบที่ถูก Soft-remove (`isRemoved = true`) จะห้ามดาวน์โหลด (`409 Conflict`), ไม่สามารถกู้คืนผ่าน UI ได้ และยังคงแสดงเมทาดาทาในประวัติหน้า Detail View พร้อมเหตุผลการลบ |
| **BR-08** | Pagination & Filter Defaults | ค่า Default ในการดึงรายการตั๋วคือ `page = 1`, `pageSize = 50`, `sortBy = "createdAt"`, `sortOrder = "desc"` หาก `page` เกินจำนวนหน้าที่มีจริง ให้คืนค่า `items: []` พร้อม metadata ที่ถูกต้อง |
| **BR-09** | Ownership Enforcement (BR-24) | การเข้าถึงทรัพยากรเฉพาะตัว ต้องตรวจลำดับดังนี้:<br>1. หาจาก `id` หากไม่พบ → ตอบ `404 NOT_FOUND`<br>2. หากพบแต่ `requesterId` ไม่ตรงกับ `X-Requester-Id` → ตอบ `403 FORBIDDEN`<br>3. ห้ามตอบ 404 แทน 403 เพื่อป้องกันการหลุดของข้อมูล |
| **BR-10** | Inactive Requester Rejection | หาก Header `X-Requester-Id` ที่แนบมาไม่มีอยู่จริงหรือมีสถานะ `isActive = false` ระบบต้องปฏิเสธการทำงานและตอบ `400 Bad Request` |

---

## 6. สรุปอินเทอร์เฟซผู้ใช้ (UI Specification Summary)

ระบบหน้าจอสำหรับ Requester ออกแบบด้วย **Zen Green Theme** ซึ่งใช้จานสีเขียวธรรมชาติ (`#006B3C`, `#0B7A46`, `#EAF6EF`) ผสานกับดีไซน์สไตล์ Modern Glassmorphism และ Clean Layout โดยแบ่งโครงสร้างหน้าจอออกเป็น 4 หน้าหลัก:

1. **Development Requester Selection (`/select-requester`):** หน้าสำหรับเลือกตัวตน Requester ชั่วคราว แสดงรายชื่อ รูปโปรไฟล์ และสถานะ Active
2. **Create Ticket (`/tickets/new`):** ฟอร์มสร้างตั๋วใหม่ 2 คอลัมน์บน Desktop พร้อมแผง Dropzone สำหรับแนบไฟล์ และ Character Counters สถิติการพิมพ์
3. **My Tickets List (`/tickets`):** หน้าแสดงรายการตั๋ว พร้อมแถบ Search & Filter Toolbar, ตาราง Data Table แสดง Priority/Status Badges และแถบ Pagination
4. **Ticket Detail View (`/tickets/:id`):** หน้าแสดงรายละเอียดตั๋ว แผงไฟล์แนบ active พร้อมปุ่มดาวน์โหลด/ลบ, ประวัติไฟล์ที่ถูก Soft-removed และ Modal Dialog สำหรับกรอกเหตุผลการลบ

> **ดูรายละเอียดการออกแบบและ CSS Design Tokens ฉบับเต็มได้ที่เอกสาร:** [ui-spec.md](file:///d:/SoftwareEngineer/toktickit/docs/lab-02/ui-spec.md)

---

## 7. การเปลี่ยนแปลงข้อมูล (Data Changes: Prisma Models)

โครงสร้างฐานข้อมูลในระบบ TokTickIT ประกอบด้วย 5 โมเดลหลักซึ่งจัดการผ่าน Prisma ORM:

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite" // หรือ postgresql
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model RequesterUser {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tickets   Ticket[]
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tickets   Ticket[]
}

model RelatedSystem {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tickets   Ticket[]
}

model Ticket {
  id                Int           @id @default(autoincrement())
  ticketNumber      String        @unique // e.g. "TKT-2026-000042"
  requesterId       Int
  categoryId        Int
  relatedSystemId   Int
  summary           String        // 5-200 chars
  description       String        // 5-2000 chars
  requestedPriority String        // "LOW", "MEDIUM", "HIGH"
  currentStatus     String        @default("NEW") // "NEW", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  requester         RequesterUser @relation(fields: [requesterId], references: [id])
  category          Category      @relation(fields: [categoryId], references: [id])
  relatedSystem     RelatedSystem @relation(fields: [relatedSystemId], references: [id])
  attachments       Attachment[]

  @@index([requesterId])
  @@index([categoryId])
  @@index([currentStatus])
}

model Attachment {
  id            Int       @id @default(autoincrement())
  ticketId      Int
  fileName      String
  mimeType      String    // image/jpeg, image/png, image/webp, application/pdf
  sizeBytes     Int       // Max 5,242,880 bytes
  filePath      String    // Disk storage path
  isRemoved     Boolean   @default(false)
  removedAt     DateTime?
  removalReason String?   // Min 5 chars when isRemoved = true
  uploadedAt    DateTime  @default(now())

  ticket        Ticket    @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@index([ticketId])
  @@index([isRemoved])
}
```

---

## 8. สรุปสัญญาเชื่อมต่อบริการ (API Contract Summary)

ระบบเชื่อมต่อผ่าน RESTful API ภายใต้ Base URL `/api` ทั้งหมด 10 Endpoints:

| # | Method | Endpoint Path | หน้าที่และรายละเอียด |
|---|---|---|---|
| 1 | `GET` | `/api/categories` | ดึงรายการหมวดหมู่ตั๋วทั้งหมดที่ active (A→Z) |
| 2 | `GET` | `/api/related-systems` | ดึงรายการระบบที่เกี่ยวข้องทั้งหมดที่ active (A→Z) |
| 3 | `GET` | `/api/requesters` | ดึงรายการ Development Requester เฉพาะที่มี `isActive = true` (A→Z) |
| 4 | `POST` | `/api/tickets` | สร้างตั๋วใหม่ รับ JSON Body + Validation + ตอบ 201 Created |
| 5 | `GET` | `/api/tickets` | ดึงรายการตั๋วของ Requester ปัจจุบัน รองรับ Search, Filter, Sort และ Pagination |
| 6 | `GET` | `/api/tickets/:id` | ดึงรายละเอียดตั๋วใบเดียวพร้อมรายการไฟล์แนบ + Ownership Check (403/404) |
| 7 | `POST` | `/api/tickets/:id/attachments` | อัปโหลดไฟล์แนบ (`multipart/form-data`) + ตรวจชนิด/ขนาด/โควตา |
| 8 | `GET` | `/api/attachments/:id` | ดึงข้อมูลเมทาดาทาของไฟล์แนบ + Ownership Check (403/404) |
| 9 | `GET` | `/api/attachments/:id/download` | ดาวน์โหลดไฟล์แนบดิบ (เฉพาะไฟล์ที่ยัง active เท่านั้น) |
| 10 | `PATCH` | `/api/attachments/:id/remove` | ทำ Soft-remove ไฟล์แนบ พร้อมบันทึกเหตุผล `removalReason` (≥5 ตัวอักษร) |

> **ดูเอกสารข้อกำหนด API และตัวอย่าง JSON Payload ฉบับเต็มได้ที่:** [api-spec.md](file:///d:/SoftwareEngineer/toktickit/docs/lab-02/api-spec.md)

---

## 9. ข้อกำหนดเชิงคุณภาพ (Non-Functional Requirements: NFR-xx)

- **NFR-01: Performance & Response Time:** Endpoint ประเภทอ่านข้อมูล (`GET`) ต้องตอบสนองภายใน 200ms และการอัปโหลดไฟล์ขนาด 5MB ต้องประมวลผลเสร็จสิ้นภายใน 1.5 วินาที
- **NFR-02: Security & Tenant Isolation:** ระบบต้องตรวจสอบ Header `X-Requester-Id` อย่างเข้มงวดเพื่อแยกแยะข้อมูลของแต่ละ Requester ออกจากกันอย่างเด็ดขาด
- **NFR-03: Data Integrity & Resiliency:** ระบบต้องมี Foreign Key Constraints และ Cascading Strategy ที่ถูกต้อง พร้อมทั้งบันทึก Audit Trail ของไฟล์ที่ถูกลบผ่าน `removedAt` และ `removalReason`
- **NFR-04: Usability & Mobile Accessibility:** UI ต้องสามารถใช้งานได้อย่างสมบูรณ์บนอุปกรณ์ทุกขนาด (Desktop, Tablet, Mobile) และมีข้อความแจ้งเตือนความผิดพลาด (Validation Error) ที่ชัดเจน อ่านเข้าใจง่าย

---

## 10. เกณฑ์การตรวจรับงาน (Acceptance Criteria: AC-xx)

- **AC-01:** สามารถสลับเปลี่ยนตัวตน Requester ผ่านสวิตช์ในระบบ และส่ง Header `X-Requester-Id` ได้ถูกต้อง
- **AC-02:** สามารถสร้าง Ticket ใหม่พร้อมข้อมูลที่ถูกต้อง และได้รับ `ticketNumber` ในรูปแบบ `TKT-YYYY-XXXXXX` และสถานะ `NEW`
- **AC-03:** หากกรอกข้อมูลสร้าง Ticket ไม่ครบหรือผิดกติกา ระบบต้องตอบ `400 Bad Request` พร้อมรายการฟิลด์ที่ผิดพลาด
- **AC-04:** สามารถอัปโหลดไฟล์แนบชนิด JPEG, PNG, WEBP, PDF ขนาดไม่เกิน 5MB ได้สำเร็จ
- **AC-05:** หากอัปโหลดไฟล์เกิน 5MB ระบบต้องตอบ `413 Payload Too Large` และหากเป็นชนิดไฟล์ที่ไม่รองรับต้องตอบ `415 Unsupported Media Type`
- **AC-06:** ตั๋ว 1 ใบไม่สามารถมี Active Attachments เกิน 5 ไฟล์ได้ (หากเกินตอบ `409 Conflict`)
- **AC-07:** หน้า My Tickets แสดงเฉพาะตั๋วที่เป็นของ Requester ที่เลือกอยู่เท่านั้น
- **AC-08:** การค้นหาตั๋วด้วยคำค้นใน Summary หรือ Ticket Number ทำงานได้ถูกต้องแบบ Case-insensitive
- **AC-09:** การกรอกตัวกรอง Category, Priority, Status ทำงานร่วมกันแบบ AND Logic ได้ถูกต้อง
- **AC-10:** การแบ่งหน้า (Pagination) และการเลือกระบุจำนวนรายการต่อหน้า (10, 20, 50) ทำงานได้ถูกต้อง
- **AC-11:** สามารถเข้าดูรายละเอียดตั๋วและประวัติไฟล์แนบในหน้า Detail View ได้
- **AC-12:** สามารถดาวน์โหลดไฟล์แนบที่ยัง Active ได้สำเร็จ
- **AC-13:** การ Soft-remove ไฟล์แนบพร้อมกรอกเหตุผล ≥ 5 ตัวอักษรสำเร็จ ทำให้ไฟล์เปลี่ยนสถานะเป็น `isRemoved = true`
- **AC-14:** ไฟล์แนบที่ถูก Soft-remove ไม่สามารถดาวน์โหลดได้อีกต่อไป (`409 Conflict`)
- **AC-15:** หากพยายามเข้าถึง Ticket หรือ Attachment ของ Requester คนอื่น ระบบต้องตอบ `403 Forbidden` เสมอ
