# Lab 2 — เอกสาร API Specification

> **สถานะ:** เอกสารฉบับสมบูรณ์สำหรับพัฒนาและทดสอบ API  
> **Base URL:** `/api`  
> **รูปแบบข้อมูล:** `application/json` ทุก endpoint ยกเว้น endpoint อัปโหลดไฟล์ที่ใช้ `multipart/form-data`

---

## 0. ภาพรวมตารางสรุป 10 Endpoints หลัก

| # | Endpoint | Method | ข้อกำหนดสำคัญ |
|---|---|---|---|
| 1 | `/api/categories` | `GET` | ดึงข้อมูลหมวดหมู่ทั้งหมดที่ active เรียงตามชื่อ A→Z |
| 2 | `/api/related-systems` | `GET` | ดึงข้อมูลระบบที่เกี่ยวข้องทั้งหมดที่ active เรียงตามชื่อ A→Z |
| 3 | `/api/requesters` | `GET` | ดึงข้อมูล Development Requester เฉพาะที่มี `isActive = true` เรียงตามชื่อ A→Z |
| 4 | `/api/tickets` | `POST` | สร้างตั๋วใหม่ รับ request body + validation + ตอบ 201 พร้อม error cases |
| 5 | `/api/tickets` | `GET` | ดึงรายการตั๋ว รองรับ query params (`search`, `category`, `requestedPriority`, `status`, `sortBy`, `sortOrder`, `page`, `pageSize`) + pagination metadata |
| 6 | `/api/tickets/:id` | `GET` | ดึงรายละเอียดตั๋วใบเดียว พร้อมรายการไฟล์แนบ + ตรวจสอบ ownership (403/404) |
| 7 | `/api/tickets/:id/attachments` | `POST` | อัปโหลดไฟล์แนบ (`multipart/form-data`) + ตรวจชนิดไฟล์/ขนาด (≤5MB)/โควตา (≤5 ไฟล์) + error (400, 403, 404, 409, 413, 415) |
| 8 | `/api/attachments/:id` | `GET` | ดึงข้อมูลเมทาดาทาของไฟล์แนบ + ตรวจสอบ ownership (403/404) |
| 9 | `/api/attachments/:id/download` | `GET` | ดาวน์โหลดไฟล์แนบดิบ + อนุญาตเฉพาะไฟล์ที่ยัง active เท่านั้น (409 หากลบไปแล้ว) |
| 10 | `/api/attachments/:id/remove` | `PATCH` / `DELETE` | ทำ Soft-remove ไฟล์แนบ พร้อมตรวจสอบ `removalReason` (อย่างน้อย 5 ตัวอักษร) + 409 หากลบซ้ำ |

---

## 1. กลไกยืนยันตัวตนชั่วคราวและรูปแบบ Response มาตรฐาน

### 1.1 HTTP Header ยืนยันตัวตน (`X-Requester-Id`)
Lab 2 ยังไม่มีระบบ Authentication จริง ทุก Request ที่ต้องการยืนยันตัวตนของ Requester จะต้องแนบ **HTTP Header ชื่อ `X-Requester-Id`** มาด้วย เช่น:

```http
GET /api/tickets?page=1 HTTP/1.1
Host: localhost:3000
X-Requester-Id: 1
```

### 1.2 รูปแบบ Response มาตรฐาน

**กรณีสำเร็จ (HTTP 200 / 201):**
```json
{
  "success": true,
  "data": { }
}
```

**กรณีผิดพลาด (HTTP 400 / 403 / 404 / 409 / 413 / 415 / 500):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ข้อมูลไม่ถูกต้องตามกติกา",
    "fields": [
      { "field": "summary", "message": "Summary is required and must be 5-200 characters." }
    ]
  }
}
```
- Array `fields` จะใส่มาเฉพาะกรณี Validation Error (400) เท่านั้น
- ห้ามส่ง stack trace หรือ error message ดิบจาก Database กลับไปยัง Client เด็ดขาด

---

## 2. รหัสสถานะ HTTP ที่ใช้ทั้งหมด

| Status Code | นิยาม | สถานการณ์ที่ใช้ |
|---|---|---|
| `200 OK` | สำเร็จ | ดึงข้อมูลสำเร็จ, อัปเดตข้อมูลสำเร็จ, ดาวน์โหลดไฟล์สำเร็จ |
| `201 Created` | สร้างสำเร็จ | สร้าง Ticket สำเร็จ, อัปโหลด Attachment สำเร็จ |
| `400 Bad Request` | ข้อมูลไม่ถูกต้อง | ข้อมูลใน Body/Query/Header ไม่ผ่าน Validation |
| `403 Forbidden` | ไม่มีสิทธิ์เข้าถึง | ตรวจสอบ ownership แล้ว Ticket/Attachment ไม่ใช่ของ Requester ที่แนบมาใน Header |
| `404 Not Found` | ไม่พบทรัพยากร | ไม่พบ Ticket, Attachment หรือ Endpoint ที่ระบุในระบบ |
| `409 Conflict` | ขัดแย้งกับสถานะ | อัปโหลดไฟล์เกินโควตา 5 ไฟล์, ดาวน์โหลดไฟล์ที่ลบไปแล้ว, ลบไฟล์ซ้ำ |
| `413 Payload Too Large` | ไฟล์ใหญ่เกินไป | อัปโหลดไฟล์แนบขนาดเกิน 5MB (5,242,880 bytes) |
| `415 Unsupported Media Type` | ชนิดไฟล์ไม่รองรับ | ชนิดไฟล์แนบไม่ใช่ JPEG, PNG, WEBP หรือ PDF |
| `500 Internal Server Error` | ข้อผิดพลาดฝั่ง Server | เกิด Error ที่ไม่คาดคิดในการประมวลผลหรือติดต่อ Database |

---

## 3. หลักการตรวจสอบความเป็นเจ้าของ (Ownership Enforcement Rules)

ทุก Endpoint ที่เข้าถึงทรัพยากรเฉพาะเจาะจง (`/api/tickets/:id`, `/api/tickets/:id/attachments`, `/api/attachments/:id`, `/api/attachments/:id/download`, `/api/attachments/:id/remove`) ต้องตรวจสอบตามลำดับดังนี้:

1. ค้นหาทรัพยากรจาก `id` ใน URL Path
2. **หากไม่พบทรัพยากรเลย** → ตอบ `404 NOT_FOUND`
3. **หากพบทรัพยากร แต่ `requesterId` ไม่ตรงกับ `X-Requester-Id` ใน Header** → ตอบ `403 FORBIDDEN`
4. **ข้อห้ามสำคัญ (BR-24):** ห้ามตอบ 404 แทน 403 เพื่อป้องกันการรั่วไหลของข้อมูล (Information Leakage) ว่ามีทรัพยากรนั้นอยู่จริงหรือไม่

---

## 4. รายละเอียดของทั้ง 10 Endpoints

---

### Endpoint 1: `GET /api/categories` — ดึงรายการหมวดหมู่ตั๋ว

ดึงหมวดหมู่ตั๋วทั้งหมดที่ยัง active เรียงลำดับตามชื่อ (A→Z)

- **HTTP Method:** `GET`
- **Path:** `/api/categories`
- **Header:** ไม่บังคับแนบ `X-Requester-Id`

#### Response สำเร็จ (HTTP 200 OK):
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Account and Access" },
    { "id": 2, "name": "Hardware" },
    { "id": 3, "name": "Network" },
    { "id": 4, "name": "Software" }
  ]
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `500` | `SERVER_ERROR` | ข้อผิดพลาดที่ไม่คาดคิดในการดึงข้อมูลจาก Database |

---

### Endpoint 2: `GET /api/related-systems` — ดึงรายการระบบที่เกี่ยวข้อง

ดึงระบบที่เกี่ยวข้องทั้งหมดที่ยัง active เรียงลำดับตามชื่อ (A→Z)

- **HTTP Method:** `GET`
- **Path:** `/api/related-systems`
- **Header:** ไม่บังคับแนบ `X-Requester-Id`

#### Response สำเร็จ (HTTP 200 OK):
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Corporate Laptop" },
    { "id": 2, "name": "Email & Communication" },
    { "id": 3, "name": "HR Portal" },
    { "id": 4, "name": "Internal Network / VPN" }
  ]
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `500` | `SERVER_ERROR` | ข้อผิดพลาดที่ไม่คาดคิดในการดึงข้อมูลจาก Database |

---

### Endpoint 3: `GET /api/requesters` — ดึงรายการ Development Requesters

ดึงรายชื่อ Development Requester เฉพาะที่มี `isActive = true` เรียงลำดับตามชื่อ (A→Z)

- **HTTP Method:** `GET`
- **Path:** `/api/requesters`
- **Header:** ไม่บังคับแนบ `X-Requester-Id`

#### Response สำเร็จ (HTTP 200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jennifer Anderson",
      "email": "jennifer.anderson@example.com"
    },
    {
      "id": 2,
      "name": "Michael Brown",
      "email": "michael.brown@example.com"
    }
  ]
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `500` | `SERVER_ERROR` | ข้อผิดพลาดที่ไม่คาดคิดในการดึงข้อมูลจาก Database |

---

### Endpoint 4: `POST /api/tickets` — สร้างตั๋วแจ้งปัญหาใหม่

สร้างตั๋วแจ้งปัญหาใหม่ในระบบ

- **HTTP Method:** `POST`
- **Path:** `/api/tickets`
- **Header:** `X-Requester-Id` (บังคับ)
- **Content-Type:** `application/json`

#### Request Body Payload:
```json
{
  "categoryId": 2,
  "relatedSystemId": 3,
  "requestedPriority": "MEDIUM",
  "summary": "Laptop battery drains quickly",
  "description": "My laptop battery is draining much faster than usual even when the system is idle."
}
```

#### กติกา Validation:
| ฟิลด์ | กติกา Validation |
|---|---|
| `categoryId` | บังคับส่ง, ต้องเป็น integer ที่มีอยู่จริงและ active |
| `relatedSystemId` | บังคับส่ง, ต้องเป็น integer ที่มีอยู่จริงและ active |
| `requestedPriority` | บังคับส่ง, ค่าที่รับได้คือ `"LOW"`, `"MEDIUM"`, `"HIGH"` เท่านั้น |
| `summary` | บังคับส่ง, ข้อความหลัง trim ต้องมีความยาว 5 – 200 ตัวอักษร |
| `description` | บังคับส่ง, ข้อความหลัง trim ต้องมีความยาว 5 – 2000 ตัวอักษร |

#### Response สำเร็จ (HTTP 201 Created):
```json
{
  "success": true,
  "data": {
    "id": 42,
    "ticketNumber": "TKT-2026-000042",
    "requesterId": 1,
    "categoryId": 2,
    "relatedSystemId": 3,
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster than usual even when the system is idle.",
    "requestedPriority": "MEDIUM",
    "currentStatus": "NEW",
    "createdAt": "2026-08-22T07:54:00.000Z",
    "updatedAt": "2026-08-22T07:54:00.000Z"
  }
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `400` | `MISSING_REQUESTER_HEADER` | ไม่ได้แนบ Header `X-Requester-Id` |
| `400` | `INVALID_REQUESTER` | Requester ที่ระบุใน Header ไม่มีอยู่จริงหรือ `isActive = false` |
| `400` | `VALIDATION_ERROR` | ฟิลด์ใดฟิลด์หนึ่งไม่ผ่านกติกา Validation |
| `400` | `INVALID_CATEGORY` | `categoryId` ไม่มีอยู่จริงหรือไม่อยู่ในสถานะ active |
| `400` | `INVALID_RELATED_SYSTEM` | `relatedSystemId` ไม่มีอยู่จริงหรือไม่อยู่ในสถานะ active |
| `500` | `SERVER_ERROR` | เกิดข้อผิดพลาดฝั่ง Database ระหว่างการสร้างตั๋ว |

---

### Endpoint 5: `GET /api/tickets` — ดึงรายการตั๋วของ Requester ปัจจุบัน

ดึงรายการตั๋วของ Requester ที่ระบุใน `X-Requester-Id` พร้อมรองรับการค้นหา กรอง และแบ่งหน้า (Pagination)

- **HTTP Method:** `GET`
- **Path:** `/api/tickets`
- **Header:** `X-Requester-Id` (บังคับ)

#### Query Parameters:
| พารามิเตอร์ | ประเภท | ค่า Default | คำอธิบาย |
|---|---|---|---|
| `search` | string | `""` | ค้นหาแบบ case-insensitive ใน `summary` และ `ticketNumber` |
| `category` | integer | `null` | กรองด้วย `categoryId` |
| `requestedPriority` | string | `null` | กรองด้วยความสำคัญ (`"LOW"`, `"MEDIUM"`, `"HIGH"`) |
| `status` | string | `null` | กรองด้วยสถานะ (`"NEW"`, `"OPEN"`, `"IN_PROGRESS"`, `"RESOLVED"`, `"CLOSED"`) |
| `sortBy` | string | `"createdAt"` | เรียงตามฟิลด์ (`"ticketNumber"`, `"createdAt"`, `"updatedAt"`) |
| `sortOrder` | string | `"desc"` | ทิศทางเรียงลำดับ (`"asc"`, `"desc"`) |
| `page` | integer | `1` | เลขหน้า (เริ่มที่ 1) |
| `pageSize` | integer | `50` | จำนวนรายการต่อหน้า (รับได้เฉพาะ `10`, `20`, `50`) |

#### Response สำเร็จ (HTTP 200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 42,
        "ticketNumber": "TKT-2026-000042",
        "summary": "Laptop battery drains quickly",
        "category": { "id": 2, "name": "Hardware" },
        "requestedPriority": "MEDIUM",
        "currentStatus": "NEW",
        "createdAt": "2026-08-22T07:54:00.000Z",
        "updatedAt": "2026-08-22T07:54:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 50,
      "totalItems": 42,
      "totalPages": 1
    }
  }
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `400` | `MISSING_REQUESTER_HEADER` | ไม่ได้แนบ Header `X-Requester-Id` |
| `400` | `INVALID_PAGE` | ค่า `page` ไม่ใช่จำนวนเต็มบวก |
| `400` | `INVALID_PAGE_SIZE` | ค่า `pageSize` ไม่ใช่ 10, 20 หรือ 50 |
| `400` | `INVALID_SORT` | `sortBy` หรือ `sortOrder` ไม่อยู่ในค่าที่กำหนด |
| `500` | `SERVER_ERROR` | ข้อผิดพลาดที่ไม่คาดคิดฝั่ง Server |

---

### Endpoint 6: `GET /api/tickets/:id` — ดึงรายละเอียดตั๋วใบเดียว

ดึงรายละเอียดฉบับเต็มของ Ticket รวมทั้งรายการไฟล์แนบทั้งหมด (ทั้งที่ยัง Active และที่ถูก Soft-remove ไปแล้ว)

- **HTTP Method:** `GET`
- **Path:** `/api/tickets/:id`
- **Header:** `X-Requester-Id` (บังคับ)

#### Response สำเร็จ (HTTP 200 OK):
```json
{
  "success": true,
  "data": {
    "id": 42,
    "ticketNumber": "TKT-2026-000042",
    "category": { "id": 2, "name": "Hardware" },
    "relatedSystem": { "id": 3, "name": "Corporate Laptop" },
    "summary": "Laptop battery drains quickly",
    "description": "My laptop battery is draining much faster than usual even when the system is idle.",
    "requestedPriority": "MEDIUM",
    "currentStatus": "NEW",
    "createdAt": "2026-08-22T07:54:00.000Z",
    "updatedAt": "2026-08-22T07:54:00.000Z",
    "attachments": [
      {
        "id": 7,
        "fileName": "screenshot.png",
        "mimeType": "image/png",
        "sizeBytes": 1258291,
        "uploadedAt": "2026-08-22T08:00:00.000Z",
        "isRemoved": false,
        "removedAt": null,
        "removalReason": null
      },
      {
        "id": 5,
        "fileName": "old_report.pdf",
        "mimeType": "application/pdf",
        "sizeBytes": 450120,
        "uploadedAt": "2026-08-22T07:55:00.000Z",
        "isRemoved": true,
        "removedAt": "2026-08-22T08:05:00.000Z",
        "removalReason": "แนบไฟล์ผิดเวอร์ชัน"
      }
    ]
  }
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `400` | `MISSING_REQUESTER_HEADER` | ไม่ได้แนบ Header `X-Requester-Id` |
| `403` | `FORBIDDEN` | พบ Ticket แต่เป็นของ Requester คนอื่น (Ownership Check ไม่ผ่าน) |
| `404` | `NOT_FOUND` | ไม่พบ Ticket ที่ id นี้ในระบบ |
| `500` | `SERVER_ERROR` | ข้อผิดพลาดที่ไม่คาดคิดฝั่ง Server |

---

### Endpoint 7: `POST /api/tickets/:id/attachments` — อัปโหลดไฟล์แนบ

อัปโหลดไฟล์แนบเข้าสู่ Ticket

- **HTTP Method:** `POST`
- **Path:** `/api/tickets/:id/attachments`
- **Header:** `X-Requester-Id` (บังคับ)
- **Content-Type:** `multipart/form-data`
- **Form Field Name:** `file` (ส่งไฟล์เดียวต่อ 1 Request)

#### กติกา Validation:
- **ชนิดไฟล์ที่ยอมรับ (Allowed MIME Types):** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- **ขนาดไฟล์สูงสุด:** ไม่เกิน 5MB (5,242,880 bytes)
- **โควตาไฟล์แนบ:** ตั๋ว 1 ใบมี Active Attachments (`isRemoved = false`) ได้ไม่เกิน 5 ไฟล์

#### Response สำเร็จ (HTTP 201 Created):
```json
{
  "success": true,
  "data": {
    "id": 8,
    "ticketId": 42,
    "fileName": "report.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 819200,
    "uploadedAt": "2026-08-22T09:00:00.000Z",
    "isRemoved": false
  }
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `400` | `MISSING_REQUESTER_HEADER` | ไม่ได้แนบ Header `X-Requester-Id` |
| `400` | `NO_FILE` | ไม่ได้แนบไฟล์มาใน form field `file` |
| `403` | `FORBIDDEN` | Ticket นี้ไม่ได้เป็นของ Requester ปัจจุบัน |
| `404` | `NOT_FOUND` | ไม่พบ Ticket id ที่ระบุ |
| `409` | `ATTACHMENT_LIMIT_REACHED` | มี Active Attachment ครบ 5 ไฟล์แล้ว |
| `413` | `FILE_TOO_LARGE` | ขนาดไฟล์ใหญ่เกิน 5MB |
| `415` | `UNSUPPORTED_FILE_TYPE` | ชนิดไฟล์ไม่อยู่ในประเภทที่อนุญาต |
| `500` | `SERVER_ERROR` | เกิดข้อผิดพลาดขณะบันทึกไฟล์ (Ticket เดิมยังคงปลอดภัย) |

---

### Endpoint 8: `GET /api/attachments/:id` — ดึงข้อมูลเมทาดาทาของไฟล์แนบ

ดึงข้อมูลเมทาดาทาของ Attachment โดยไม่ดาวน์โหลดไฟล์ดิบ

- **HTTP Method:** `GET`
- **Path:** `/api/attachments/:id`
- **Header:** `X-Requester-Id` (บังคับ)

#### Response สำเร็จ (HTTP 200 OK):
```json
{
  "success": true,
  "data": {
    "id": 7,
    "ticketId": 42,
    "fileName": "screenshot.png",
    "mimeType": "image/png",
    "sizeBytes": 1258291,
    "uploadedAt": "2026-08-22T08:00:00.000Z",
    "isRemoved": false,
    "removedAt": null,
    "removalReason": null
  }
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `400` | `MISSING_REQUESTER_HEADER` | ไม่ได้แนบ Header `X-Requester-Id` |
| `403` | `FORBIDDEN` | Attachment นี้ผูกกับ Ticket ของ Requester คนอื่น |
| `404` | `NOT_FOUND` | ไม่พบ Attachment ที่ id นี้ในระบบ |
| `500` | `SERVER_ERROR` | ข้อผิดพลาดที่ไม่คาดคิดฝั่ง Server |

---

### Endpoint 9: `GET /api/attachments/:id/download` — ดาวน์โหลดไฟล์แนบ

ดาวน์โหลดไฟล์แนบดิบ (Binary Data)

- **HTTP Method:** `GET`
- **Path:** `/api/attachments/:id/download`
- **Header:** `X-Requester-Id` (บังคับ)

#### Response สำเร็จ (HTTP 200 OK):
- ส่งไฟล์ดิบกลับมาพร้อม HTTP Response Headers:
  - `Content-Type: <mimeType>`
  - `Content-Disposition: attachment; filename="<fileName>"`

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `400` | `MISSING_REQUESTER_HEADER` | ไม่ได้แนบ Header `X-Requester-Id` |
| `403` | `FORBIDDEN` | Attachment ผูกอยู่กับ Ticket ของ Requester คนอื่น |
| `404` | `NOT_FOUND` | ไม่พบ Attachment ที่ id นี้ในระบบ |
| `409` | `ATTACHMENT_REMOVED` | ไฟล์แนบนี้ถูก Soft-remove ไปแล้ว (ห้ามดาวน์โหลดไฟล์ที่ถูกลบ) |
| `500` | `SERVER_ERROR` | เกิดข้อผิดพลาดในการอ่านไฟล์ดิบจากดิสก์หรือระบบจัดเก็บ |

---

### Endpoint 10: `PATCH /api/attachments/:id/remove` หรือ `DELETE /api/attachments/:id` — ลบไฟล์แนบแบบ Soft Removal

ทำการ Soft-remove ไฟล์แนบ พร้อมบันทึกเหตุผลการลบ

- **HTTP Method:** `PATCH` (หรือ `DELETE`)
- **Path:** `/api/attachments/:id/remove` (หรือ `/api/attachments/:id`)
- **Header:** `X-Requester-Id` (บังคับ)
- **Content-Type:** `application/json`

#### Request Body Payload:
```json
{
  "removalReason": "แนบไฟล์ผิด อัปโหลดซ้ำ"
}
```

#### กติกา Validation:
| ฟิลด์ | กติกา Validation |
|---|---|
| `removalReason` | บังคับส่ง, ข้อความหลัง trim ต้องมีความยาวอย่างน้อย 5 ตัวอักษร |

#### Response สำเร็จ (HTTP 200 OK):
```json
{
  "success": true,
  "data": {
    "id": 7,
    "ticketId": 42,
    "isRemoved": true,
    "removedAt": "2026-08-22T09:30:00.000Z",
    "removalReason": "แนบไฟล์ผิด อัปโหลดซ้ำ"
  }
}
```

#### กรณีผิดพลาด:
| Status | Error Code | สาเหตุ |
|---|---|---|
| `400` | `MISSING_REQUESTER_HEADER` | ไม่ได้แนบ Header `X-Requester-Id` |
| `400` | `VALIDATION_ERROR` | `removalReason` ว่างเปล่า หรือมีความยาวน้อยกว่า 5 ตัวอักษร |
| `403` | `FORBIDDEN` | Attachment ไม่ได้เป็นของ Requester ปัจจุบัน |
| `404` | `NOT_FOUND` | ไม่พบ Attachment ที่ id นี้ |
| `409` | `ALREADY_REMOVED` | ไฟล์แนบนี้ถูก Soft-remove ไปก่อนหน้านี้แล้ว |
| `500` | `SERVER_ERROR` | ข้อผิดพลาดที่ไม่คาดคิดฝั่ง Server |

---

## 5. สรุปความสอดคล้องและการนำไปใช้งาน

1. ทุกเวลาที่ถูกส่งกลับใน JSON Response ต้องอยู่ในรูปแบบ **ISO 8601 UTC String** (e.g. `"2026-08-22T07:54:00.000Z"`)
2. Path Parameter ใช้เลข `id` ภายในของทรัพยากร (เช่น `/api/tickets/42`, `/api/attachments/7`)
3. ใน Lab 2 สถานะของ Ticket ที่ถูกสร้างขึ้นมาใหม่จะเป็น `"NEW"` เสมอ
