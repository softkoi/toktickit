# Overall Reflection

ในการทำงานครั้งนี้ได้ใช้ AI (Gemini Antigravity) ด้วย Model **Gemini 3.6 Flash (Thinking)** ซึ่งในการใช้งานผมจะใช้อยู่ 2 แบบคือการใช้ในรูปแบบ ถาม-ตอบ และรูปแบบ Agent เนื่องจากผมไม่ได้มีประสบการณ์สำหรับการทำ Website มีความรู้พื้นฐานนิดหน่อย ซึ่งยังไม่พอสำหรับการทำงาน Lab ในครั้งนี้ ส่วนใหญ่จึงใช้ AI ในรูปแบบในการช่วยสอนทำ เนื่องจากผมต้องการที่จะรู้ถึงกระบวนการ และจุดประสงค์ต่าง ๆ ของการทำงาน ไม่ว่าจะเป็นการ Setup Project, การเขียน Code, การทำ Git และการทำ Test ทำให้ผมสามารถทำงาน Lab ในครั้งนี้ได้ดียิ่งขึ้น

ในงานบางส่วนผมเลือกที่จะใช้ AI Agent เนื่องจากเป็นการประหยัดเวลาในการทำงาน เช่น การจัดเตรียมโครงสร้างไฟล์ Markdown, การช่วยสร้างโค้ดเริ่มต้น หรือการรันคำสั่งทดสอบระบบ ซึ่งหลังจากทำการทำงานทุกครั้ง ผมจะให้ AI อธิบายสิ่งที่ AI ทำทั้งหมดอย่างละเอียด เพื่อให้ผมสามารถเข้าใจโครงสร้างและตรรกะของโค้ด และสามารถอธิบายต่อหรือนำไปประยุกต์ใช้ได้ด้วยตนเอง

### สิ่งที่ AI ทำได้ดี (Strengths & Benefits):

* **ช่วยลดเวลาในการ Setup Environment:** การตั้งค่า Prisma ORM, TypeScript และการตั้งค่า CORS ทำได้อย่างรวดเร็วและถูกต้อง
* **อธิบายแนวคิดที่ซับซ้อนให้เข้าใจง่าย:** AI ช่วยอธิบายข้อแตกต่างระหว่าง Unit Test (`app.test.ts`) กับ Integration Test (`api.test.ts`), การทำงานของ `async/await` และหลักการของ CORS
* **ช่วยสร้างโครงสร้างเอกสารและ Test Cases:** สามารถสร้าง Vitest และ Supertest รวมถึงการจัดตาราง Markdown ในเอกสาร Peer Review (`reviewer.md`) ให้ผมได้เป็นระเบียบ

### ข้อจำกัดที่พบ (Limitations & Challenges):

* **ความชัดเจนของ Prompt:** ในบางครั้ง AI ให้ผลลัพธ์เป็นข้อความยาว ซึ่งเกิดจาก Prompt ที่อธิบายผลลัพธ์ที่ต้องการยังไม่ชัดเจนมากพอ ซึ่งปรับได้โดยการใช้ Prompt ที่มีการระบุรูปแบบผลลัพธ์ เช่น เป็น Markdown Table เพื่อให้อ่านเข้าใจได้ง่ายขึ้น

> [!NOTE]
> **หมายเหตุการจัดทำเอกสาร:** เนื้อหาในส่วนของ Reflection มาจากความคิดเห็นของผมเองทั้งหมด โดยผมได้ใช้ AI Agent ช่วยเรียบเรียงประโยคและจัดฟอร์แมต Markdown (Re-formatting & Polishing) อีกครั้ง เพื่อให้เอกสารมีความสวยงาม อ่านง่าย และเป็นระเบียบเรียบร้อยยิ่งขึ้น

---

# Selected Key Prompts

| Prompt Name | Actual Prompt Text | Reflection |
| :--- | :--- | :--- |
| **Plan Lab 1 Implementation** | *Read the enclosed TokTickIT Lab 1 requirements. Summarize the four GitHub Issues, their dependencies, required outputs, and required automated tests. Propose an implementation order.* | **Reflection:** วิเคราะห์โจทย์และลำดับขั้นตอนการทำตามข้อกำหนดได้อย่างถูกต้องในรอบเดียว |
| **Set Up Full-Stack Project** | *Setup the TokTickIT project tech stack using React, TypeScript, Vite, and Bootstrap for the frontend, and Node.js, Express, and TypeScript for the backend. Configure PostgreSQL and Prisma.* | **Reflection:** ช่วยจัดโครงสร้างโปรเจกต์แยกฝั่ง client และ server ได้อย่างเป็นระบบ |
| **Implement Health Check API** | *Add `GET /api/health` to the Express backend returning HTTP 200 `{ status: "ok", service: "TokTickIT API" }` and write Supertest tests.* | **Reflection:** เขียนโค้ด API พร้อมเขียน Supertest ยืนยันการทำงานได้ถูกต้อง |
| **Prisma Category Seed** | *Create the Prisma Category model with `id`, `name`, `createdAt`. Create a migration and seed script for Account and Access, Hardware, Software, Network.* | **Reflection:** สคริปต์ Seed ใช้ `upsert` ทำให้รันซ้ำกี่ครั้งก็ได้โดยข้อมูลไม่ซ้ำซ้อน |
| **Implement Category List Endpoint** | *Add `GET /api/categories` to fetch all categories from PostgreSQL via Prisma ORM.* | **Reflection:** เชื่อมต่อ Prisma Client เพื่อดึงข้อมูลออกเป็น JSON ตามที่โจทย์ต้องการ |
| **Build System Check UI** | *Build a Bootstrap page with `[Check System]` button. When clicked, display system status and render the 4 request categories with loading and error states.* | **Reflection:** ทำส่วน UI จัดการสถานะ Loading, Success (Online) และ Error (Offline) ได้สมบูรณ์ |
| **Write Vitest UI Tests** | *Write Vitest tests for `App.test.tsx` verifying initial render, successful system check button click, and API failure handling.* | **Reflection:** Mock ค่า API ได้ครอบคลุมทั้งกรณีสำเร็จและกรณีเกิด Error |
| **Review Final Lab 1 Work** | *Review the completed TokTickIT Lab 1 implementation against all acceptance criteria and document evidence.* | **Reflection:** ช่วยตรวจสอบและสรุปหลักฐานสำหรับจัดทำ PDF ส่งอาจารย์ |
