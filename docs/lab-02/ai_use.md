# Lab 2 AI Use and Reflection

ในการทำงาน Lab 2 ครั้งนี้ ได้ใช้ **Antigravity AI Coding Agent** (ผ่านทาง Google Cloud Platform / Claude 4.6 และ Gemini 3.6 Flash) ในการเป็นคู่คิดและช่วยพัฒนาซอฟต์แวร์ระบบ TokTickIT ในส่วนของผู้แจ้งปัญหา (Requester MVP)

---

## 1. Selected Key Prompts & Reflection

| # | Prompt Name | Actual Prompt Text | My Reflection |
|---|---|---|---|
| **1** | **การสรุป Requirements และออกแบบ Sprint** | ช่วยสรุป requirements ทั้งหมดของ Lab 2 จากไฟล์ spec และแบ่งงานออกเป็น User Stories สำหรับ GitHub Project Board | AI สรุปข้อมูลและแยกแยะงานได้ละเอียด ช่วยให้วางแผนและสร้าง Issue ใน Project Board ได้อย่างมีรหัสโครงสร้างชัดเจน |
| **2** | **การออกแบบ Database Schema** | ช่วยออกแบบ Prisma Schema สำหรับระบบ Lab 2 โดยรองรับ Requester, Ticket, Attachment, Category และ Related System | AI แนะนำ Audit fields (`createdAt`, `updatedAt`) และการทำ Soft delete (`removedAt`) ช่วยรักษา Audit trail ตาม Best Practices |
| **3** | **การสร้าง Ticket Number Sequence** | อยากได้รหัส Ticket รูปแบบ `TKT-YYYY-XXXXXX` ที่รันแบบอัตโนมัติและไม่ซ้ำกันตามปี ค.ศ. ปัจจุบัน | AI ออกแบบ Utility generator พร้อมแนบ Unit tests ครอบคลุม Edge cases สำหรับ Tie-breaker ลำดับเวลา |
| **4** | **การแก้ปัญหา Sorting & Pagination** | แก้ปัญหา sorting ใน GET `/api/tickets` เมื่อ createdAt มีค่าเท่ากันแล้ว pagination หลุด | AI แนะนำการใส่ `ticketNumber DESC` เป็น Secondary sort (Tie-breaker) ทำให้การแบ่งหน้ามีความเสถียร 100% |
| **5** | **ระบบ Attachment & Soft Delete** | ช่วยออกแบบการ Soft-remove ไฟล์แนบพร้อมบังคับระบุเหตุผลในการลบอย่างน้อย 5 ตัวอักษร | AI ช่วยวางโครงสร้าง API, Audit metadata (`removalReason`, `removedByRequesterId`) และ validation error handling |
| **6** | **การทำ Responsive Navbar** | ตัว Navbar บนมือถือมีไอคอน hamburger เมื่อกดแล้วเปิดแผง Drawer เมนู | AI ช่วยปรับแต่ง Tailwind CSS และ React Component state ให้รองรับทั้ง Mobile, Tablet, Desktop อย่างสวยงาม |
| **7** | **ความแตกต่างระหว่าง Vitest กับ Playwright** | อยากรู้ว่า test ตัวไหนใช้ทดสอบหน้าบ้าน และตัวไหนทดสอบ E2E flow | AI อธิบายความแตกต่างอย่างชัดเจน Vitest ใช้เทส Component/Unit ส่วน Playwright ใช้เทส Browser E2E จริง |
| **8** | **การเขียน E2E Test ด้วย Playwright** | ช่วยเขียน E2E Test ครอบคลุม flow การสลับ Requester -> สร้างตั๋ว -> อัปโหลดไฟล์ -> กรองตั๋ว | AI เจนชุดทดสอบ Playwright ได้ถูกต้อง ตรวจสอบองค์ประกอบบนหน้าจอได้ครบถ้วน และรองรับการทำ assertion สิทธิ์ 403 Forbidden |

---

## 2. Overall Reflection

ในการทำงาน Lab 2 นี้ การนำ **AI Agent (Antigravity)** มาใช้ในกระบวนการพัฒนาซอฟต์แวร์ช่วยเพิ่มประสิทธิภาพและความเร็วในการทำงานได้อย่างมาก โดยเฉพาะอย่างยิ่ง:

1. **ลดเวลาสร้าง Code Boilerplate และ Test Cases:** AI Agent สามารถสร้างโค้ดโครงสร้างพื้นฐาน ฟังก์ชันการทำงานร่วมกับ Prisma ORM และชุดทดสอบ (Unit, Integration, E2E) ได้อย่างรวดเร็วและถูกต้องตามมาตรฐาน
2. **ช่วยวิเคราะห์ Edge Cases และ Security:** AI Agent ช่วยเตือนถึงการป้องกันข้อมูลรั่วไหลระหว่างผู้ใช้ (Ownership Enforcement ตอบ 403 Forbidden) และการทำ Tie-breaker ในการเรียงลำดับข้อมูล
3. **การเรียนรู้และการปรับปรุงโค้ด:** การสื่อสารกับ AI Agent ในลักษณะ Interactive ช่วยให้เข้าใจโครงสร้างระบบ ภาพรวมสถาปัตยกรรม และคำสั่งการทำงานของซอฟต์แวร์ได้อย่างลึกซึ้งยิ่งขึ้น
