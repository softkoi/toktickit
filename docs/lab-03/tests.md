# Lab 3 — เอกสารแผนการทดสอบและตารางสรุปการทดสอบ (Master Test Plan & Test Matrix)

> **สถานะ:** เอกสารแผนการทดสอบระบบ (System Test Plan & Quality Assurance Strategy) - Phase 3 (Test-Driven Design Documentation)  
> **กลุ่มเป้าหมาย:** QA Engineer / Backend & Frontend Developers / AI Coding Agent  
> **วัตถุประสงค์:** กำหนดแผนการทดสอบระบบ TokTickIT ใน Lab 3 ครอบคลุมทุกระดับการทดสอบ (Unit, API Integration, UI Component, Security, Responsive Layout, Regression, E2E) เพื่อการันตีว่าทุกเกณฑ์การตรวจรับงาน (`AC-01` ถึง `AC-12`) และกฎทางธุรกิจ (`BR-01` ถึง `BR-15`) มีการทดสอบรองรับครบ 100% ก่อนลงมือพัฒนาโค้ดจริง

---

## 1. ภาพรวมกลยุทธ์การทดสอบ (Test Strategy & Tooling Framework)

การทดสอบระบบ TokTickIT ใน Lab 3 ถูกออกแบบภายใต้แนวคิด **Test-Driven Design (Test DD)** โดยการกำหนดรายละเอียดแผนการทดสอบ และ Test Case ล่วงหน้า 5 ระดับชั้น (Test Layers):

```
                  ┌───────────────────────────────┐
                  │       E2E Flow Tests          │ (Playwright E2E)
                  ├───────────────────────────────┤
                  │  Responsive & Accessibility   │ (Playwright Visual & axe-core)
                  ├───────────────────────────────┤
                  │     UI Component Tests        │ (Vitest / React Testing Library)
                  ├───────────────────────────────┤
                  │    API Integration Tests      │ (Supertest / Vitest API)
                  ├───────────────────────────────┤
                  │       Unit Service Tests      │ (Vitest Unit)
                  └───────────────────────────────┘
```

### ประเภทการทดสอบ (Test Types Mapping)
1. **Unit Test**: ทดสอบ Logic/Service ฟังก์ชันย่อยในระดับ Isolated Code (เช่น Password hashing, Validation schemas, State machine transitions)
2. **API Test (Integration)**: ทดสอบ REST API Endpoints ผ่าน HTTP Requests จริง รวมถึง Authentication, Status Codes (200, 400, 401, 403, 409) และ Cookies
3. **UI Test (Component)**: ทดสอบ React Components, Form validation, Loading states, และ User Event Handling
4. **Security Test**: ทดสอบ RBAC Authorization, Session Invalidation, Password Strength Boundary, Inactive Account Locking
5. **Regression Test**: การันตีฟีเจอร์เดิมจาก Lab 2 (Requester Ticket Creation, Status Viewing, Attachment) และ Data Migration ยังคงทำงานได้อย่างถูกต้อง
6. **Responsive & Accessibility Test**: ทดสอบ Layout บน Desktop/Mobile (Table vs Cards) และ WCAG 2.1 Standard
7. **E2E Test**: ทดสอบ User Journey การใช้งานครบวงจรตั้งแต่ Login ถึงการปิด Ticket หรือการบริหารจัดการ User

---

## 2. ขั้นตอนที่ 1: แผนการทดสอบ Authentication, Password Boundary & Session Security

หมวดหมู่นี้ครอบคลุมการยืนยันตัวตน, ข้อกำหนดรหัสผ่าน, บัญชีที่ถูกระงับ (Inactive), การบังคับเปลี่ยนรหัสผ่านในการเข้าใช้งานครั้งแรก (First-Login Mandatory Password Change) และการจัดการ Session หลัง Logout

| Test ID | Type | requirement / AC ที่ผูก | สิ่งที่เทส (Test Description) | ผลลัพธ์ที่คาดหวัง (Expected Outcome) | path ไฟล์เทสต์ที่จะสร้าง |
|---|---|---|---|---|---|
| `TEST-001` | **API / Security** | `AC-01` / `BR-01` | เข้าสู่ระบบด้วย Email และ Password ที่ถูกต้อง (`POST /api/auth/login`) | ตอบ `200 OK` ฝัง HTTP-only Session Cookie (`toktickit_session`) และคืนค่า User Profile พร้อม Role (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`) | `server/tests/lab-03/auth.api.test.ts` |
| `TEST-002` | **API / Security** | `AC-01` / `BR-01` | เข้าสู่ระบบด้วย Email หรือ Password ที่ไม่ถูกต้อง | ตอบ `401 Unauthorized` พร้อม Error Code `INVALID_CREDENTIALS` โดยไม่ leak ข้อมูลว่า Email มีในระบบหรือไม่ | `server/tests/lab-03/auth.api.test.ts` |
| `TEST-003` | **API / Security** | `AC-05` / `BR-02` | เข้าสู่ระบบด้วยบัญชีผู้ใช้ที่ถูกระงับสิทธิ์ใช้งาน (`isActive = false`) | ตอบ `401 Unauthorized` พร้อม Error Message แจ้งว่าบัญชีถูกระงับสิทธิ์ โดยปฏิเสธการออก Session Cookie | `server/tests/lab-03/auth.api.test.ts` |
| `TEST-004` | **Unit / Security** | `AC-01` / `BR-03` | ตรวจสอบ Password Boundary & Validation rules (ความยาวขั้นต่ำ 8 ตัวอักขระ, มีตัวพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ) | Function `validatePasswordPolicy()` คืนค่า `false` สำหรับรหัสผ่านที่สั้นกว่า 8 ตัว หรือขาดอักขระตามเกณฑ์ และคืนค่า `true` เมื่อถูกต้อง | `server/tests/lab-03/password-policy.unit.test.ts` |
| `TEST-005` | **API / Security** | `AC-02` / `BR-03` | บัญชีสร้างใหม่ที่มี `mustChangePassword = true` ทำการเปลี่ยนรหัสผ่านเป็นรหัสผ่านใหม่ที่ผิดเกณฑ์ Boundary | ตอบ `400 Bad Request` พร้อมระบุข้อผิดพลาดเงื่อนไข Password Policy ที่ไม่ผ่าน | `server/tests/lab-03/auth.api.test.ts` |
| `TEST-006` | **E2E / Security** | `AC-02` / `BR-04` | First-Login Mandatory Flow: บัญชีที่มี `mustChangePassword = true` เข้าสู่ระบบครั้งแรก | ระบบตรวจพบ `mustChangePassword = true` บังคับ Redirect ไปยังหน้าเปลี่ยนรหัสผ่าน และบล็อกการเข้าถึงหน้า Dashboard จนกว่าจะเปลี่ยนรหัสผ่านสำเร็จ (`mustChangePassword` เปลี่ยนเป็น `false`) | `e2e/lab-03/authentication.spec.ts` |
| `TEST-007` | **API / Security** | `AC-01` / `BR-05` | ออกจากระบบ (`POST /api/auth/logout`) และทดสอบการเรียกใช้ Protected Endpoint หลัง Logout | ตอบ `200 OK` ล้าง Cookie `toktickit_session` และทำลาย Session บน Server เมื่อเรียกขอ Protected Endpoint ถัดไป จะตอบ `401 Unauthorized` ทันที | `server/tests/lab-03/auth.api.test.ts` |

---

## 3. ขั้นตอนถัดไปในแผนการทดสอบ (Upcoming Sections)
- **ขั้นตอนที่ 2:** RBAC Authorization Matrix & Requester Regression Tests Plan (`TEST-008` ถึง `TEST-014`)
- **ขั้นตอนที่ 3:** IT Staff Workflow & Queue / Ticket Operations Tests Plan (`TEST-015` ถึง `TEST-022`)
- **ขั้นตอนที่ 4:** Administrator User Management & Security Constraints Tests Plan (`TEST-023` ถึง `TEST-030`)
- **ขั้นตอนที่ 5:** Data Migration, Responsive UI, Accessibility & E2E Integration Strategy (`TEST-031` ถึง `TEST-037`)
