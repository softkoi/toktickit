# คู่มือขั้นตอนการเริ่มพัฒนา Feature 5: My Tickets List (การดึงโค้ดและการสร้าง Branch)

---

## 📌 ขั้นตอนที่ 1: การดึงโค้ดล่าสุดที่ Merge แล้วจาก `lab2-staging` (Git Workflow)

ทำตามคำสั่ง Git ใน Terminal ตามลำดับดังนี้:

### 1.1 สลับไปยัง branch `lab2-staging` และดึงโค้ดล่าสุด
```bash
# 1. สลับไปยัง branch lab2-staging
git checkout lab2-staging

# 2. ดึงข้อมูลล่าสุดจาก remote repository
git fetch origin

# 3. Pull โค้ดที่เพื่อนเพิ่งกด Merge เข้า lab2-staging
git pull origin lab2-staging
```

### 1.2 สร้าง Branch ใหม่สำหรับ Feature 5
```bash
# สร้างและสลับไปยัง branch ใหม่ feature/5-my-tickets (ตั้งต้นจาก lab2-staging)
git checkout -b feature/5-my-tickets
```

### 1.3 ตรวจสอบสถานะ Branch
```bash
# ตรวจสอบว่าอยู่บน branch feature/5-my-tickets แล้วหรือยัง
git status
```

---

## 📌 ขั้นตอนที่ 2: การเปิด Server และ Client สำหรับเริ่มพัฒนา

### 2.1 เปิด Backend Server
```bash
cd server
npm run dev
```

### 2.2 เปิด Frontend Client (ในอีก Terminal window)
```bash
cd client
npm run dev
```

---

## 📌 ขั้นตอนที่ 3: สเปกและข้อกำหนดสำหรับ Feature 5 (My Tickets List)

### 3.1 ภาพรวมฟีเจอร์ (FR-05, FR-06, FR-07)
- **Backend API**: พัฒนา `GET /api/tickets` ให้รองรับการค้นหา (Search), การกรอง (Filter), การเรียงลำดับ (Sort) และการแบ่งหน้า (Pagination)
- **Frontend UI**: หน้ารายการตั๋ว (`/tickets`) แสดงตารางตั๋วแจ้งปัญหาของ Requester ปัจจุบัน พร้อม Toolbar ค้นหา/กรอง และ Pagination Bar

---

### 3.2 Backend Endpoint Specification: `GET /api/tickets`

#### Headers
- `X-Requester-Id`: (บังคับ) ID ของ Requester ปัจจุบัน

#### Query Parameters
| Parameter | Type | Default | Valid Values / Description |
|---|---|---|---|
| `search` | string | `""` | ค้นหาแบบ case-insensitive ใน `summary` หรือ `ticketNumber` |
| `category` | integer | `null` | กรองด้วย `categoryId` |
| `requestedPriority` | string | `null` | กรองความสำคัญ (`"LOW"`, `"MEDIUM"`, `"HIGH"`) |
| `status` | string | `null` | กรองสถานะ (`"NEW"`, `"OPEN"`, `"IN_PROGRESS"`, `"RESOLVED"`, `"CLOSED"`) |
| `sortBy` | string | `"createdAt"` | เรียงตามฟิลด์ (`"ticketNumber"`, `"createdAt"`, `"updatedAt"`) |
| `sortOrder` | string | `"desc"` | ทิศทาง (`"asc"`, `"desc"`) |
| `page` | integer | `1` | จำนวนเต็มบวก ≥ 1 |
| `pageSize` | integer | `50` | รับได้เฉพาะ `10`, `20`, `50` |

#### Example Response (HTTP 200 OK)
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

#### Error Response Handling
- `400 MISSING_REQUESTER_HEADER`: ไม่แนบ `X-Requester-Id`
- `400 INVALID_PAGE`: `page` ไม่ใช่จำนวนเต็มบวก
- `400 INVALID_PAGE_SIZE`: `pageSize` ไม่ใช่ 10, 20, หรือ 50
- `400 INVALID_SORT`: `sortBy` หรือ `sortOrder` ไม่ถูกต้อง

---

### 3.3 Checklist รายการที่ต้องทำสำหรับ Feature 5

- [ ] **Backend**: พัฒนา controller / service สำหรับ `GET /api/tickets` ใน `server/src/controllers/ticket.controller.ts`
- [ ] **Backend**: เขียน Unit / API Integration Tests สำหรับ `GET /api/tickets`
- [ ] **Frontend**: พัฒนาหน้าแสดงรายการตั๋ว (`/tickets`) ใน `client/src/pages/MyTicketsPage.tsx` หรือ `TicketListPage.tsx`
- [ ] **Frontend**: เพิ่ม Filter & Search Toolbar และ Pagination Control
- [ ] **Verification**: รัน `npm test` ฝั่ง server และ `npm run build` ฝั่ง client เพื่อตรวจสอบความถูกต้อง
