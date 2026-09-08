# Lab 2 — UI Specification: Zen Green Theme

> **สถานะ:** ร่างมาตรฐานสำหรับการพัฒนา UI (Frontend Design Specification)  
> **ธีมหลัก:** Zen Green Theme  
> **กลุ่มเป้าหมาย:** AI Coding Agent / Frontend Developer  
> **วัตถุประสงค์:** ใช้เป็นข้อกำหนด UI/UX และ CSS Design System สำหรับพัฒนาส่วนติดต่อผู้ใช้งานของระบบ TokTickIT ใน Lab 2 ให้มีความสวยงาม เป็นสัดส่วน สอดคล้องกันทุกหน้าจอ และพร้อมสำหรับการทดสอบ Visual QA

---

## 1. Design Tokens (CSS Custom Properties)

AI Coding Agent สามารถคัดลอก `:root` block นี้ไปวางไว้ใน `index.css` หรือ `styles.css` หลักของโปรเจกต์ได้ทันที

```css
:root {
  /* ==========================================================================
     1.1 COLOR SYSTEM — Zen Green Palette
     ========================================================================== */
  
  /* Primary Brand Colors */
  --color-primary-900: #00361E; /* Deep Forest Green (Dark Mode / High Contrast Text) */
  --color-primary-800: #004D2B; /* Dark Forest Green (Active / Pressed) */
  --color-primary-700: #006B3C; /* Main Zen Green Primary Brand Color */
  --color-primary-600: #0B7A46; /* Medium Zen Green (Hover state) */
  --color-primary-500: #148A52; /* Accent Green */
  --color-primary-200: #A8D0B9; /* Border Accent / Focus Ring Tint */
  --color-primary-100: #D1E4D9; /* Default Element Border */
  --color-primary-50:  #EAF6EF; /* Subtle Background Tint / Selected State */
  --color-primary-25:  #F4F9F6; /* App Background / Surface Soft Tint */

  /* Neutral Surface & Layout Colors */
  --color-bg-app:        #F4F9F6; /* Page background color */
  --color-surface-card:  #FFFFFF; /* White card surface */
  --color-surface-hover: #F8FBF9; /* Subtle hover state for lists/tables */
  --color-divider:       #E2EDE6; /* Horizontal & vertical dividers */

  /* Typography / Text Colors */
  --color-text-primary:   #1A2D23; /* High-contrast text (Headings, primary values) */
  --color-text-secondary: #4A6053; /* Medium-contrast text (Labels, subtitles) */
  --color-text-muted:     #789082; /* Low-contrast text (Placeholders, hints, timestamps) */
  --color-text-inverse:   #FFFFFF; /* Light text for dark buttons & badges */

  /* Status Badges Colors */
  /* New / Open Status */
  --color-status-new-bg:   #EAF6EF;
  --color-status-new-text: #006B3C;
  --color-status-new-border: #A8D0B9;

  /* Priority Badges Colors */
  --color-priority-low-bg:     #E1F5FE;
  --color-priority-low-text:   #0288D1;
  --color-priority-low-border: #90CAF9;

  --color-priority-medium-bg:     #FFF4E5;
  --color-priority-medium-text:   #ED6C02;
  --color-priority-medium-border: #FFCC80;

  --color-priority-high-bg:     #FFEBEE;
  --color-priority-high-text:   #C62828;
  --color-priority-high-border: #EF9A9A;

  /* Feedback / Error / Alert Colors */
  --color-error-base:     #D32F2F; /* Error border & icon */
  --color-error-hover:    #B71C1C; /* Darker error state */
  --color-error-bg:       #FFF8F8; /* Soft error background */
  --color-error-text:     #D32F2F; /* Validation error text */
  --color-error-focus-ring: rgba(211, 47, 47, 0.25);

  --color-success-base:   #2E7D32;
  --color-success-bg:     #E8F5E9;
  --color-success-text:   #1B5E20;

  /* Focus Ring */
  --color-focus-ring:     rgba(0, 107, 60, 0.25);

  /* ==========================================================================
     1.2 SPACING SCALE
     ========================================================================== */
  --space-0-5: 0.125rem; /* 2px */
  --space-1:   0.25rem;  /* 4px */
  --space-2:   0.5rem;   /* 8px */
  --space-3:   0.75rem;  /* 12px */
  --space-4:   1rem;     /* 16px */
  --space-5:   1.25rem;  /* 20px */
  --space-6:   1.5rem;   /* 24px */
  --space-8:   2rem;     /* 32px */
  --space-10:  2.5rem;   /* 40px */
  --space-12:  3rem;     /* 48px */
  --space-16:  4rem;     /* 64px */

  /* ==========================================================================
     1.3 TYPOGRAPHY SCALE
     ========================================================================== */
  --font-family-base: 'Inter', 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  --font-size-xs:  0.75rem;  /* 12px - Small captions, tags */
  --font-size-sm:  0.875rem; /* 14px - Table data, helper text, buttons */
  --font-size-md:  1rem;     /* 16px - Base body text, inputs */
  --font-size-lg:  1.125rem; /* 18px - Subtitles, card titles */
  --font-size-xl:  1.25rem;  /* 20px - Section headers */
  --font-size-2xl: 1.5rem;   /* 24px - Page titles */
  --font-size-3xl: 2rem;     /* 32px - Hero titles */

  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  --line-height-tight:  1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* ==========================================================================
     1.4 ELEVATION & BORDER RADIUS
     ========================================================================== */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 9999px;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);

  /* Transition speeds */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 2. ฟิลด์อินพุตและสถานะ (Form Field States)

ทุก Form Input Control (Text input, Select, Textarea) ต้องปฏิบัติตามข้อกำหนดสไตล์ของสถานะต่างๆ ต่อไปนี้อย่างเคร่งครัด:

```
┌────────────────────────────────────────────────────────┐
│ Label Text *                                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Input Value or Placeholder Text                    │ │
│ └────────────────────────────────────────────────────┘ │
│ Helper text or validation error message                │
└────────────────────────────────────────────────────────┘
```

| สถานะ (State) | Background | Border Color / Width | Text Color | Box Shadow / Focus Ring | Cursor Style | หมายเหตุวิชวล |
|---|---|---|---|---|---|---|
| **Editable (Default)** | `#FFFFFF` | `1px solid #D1E4D9` | `#1A2D23` | `none` | `text` (หรือ `pointer` สำหรับ select) | แสดง placeholder เป็นสี `#789082` |
| **Focused** | `#FFFFFF` | `1px solid #0B7A46` | `#1A2D23` | `0 0 0 3px rgba(0, 107, 60, 0.25)` | `text` | Outline ปิดใช้งาน (`outline: none`) ให้ใช้ box-shadow แทน |
| **Error** | `#FFF8F8` | `1px solid #D32F2F` | `#1A2D23` | `0 0 0 3px rgba(211, 47, 47, 0.25)` | `text` | มีข้อความ Error สี `#D32F2F` ขนาด `14px` ด้านล่าง field |
| **Read-Only** | `#F4F9F6` | `1px solid #E2EDE6` | `#4A6053` | `none` | `default` | ห้ามพิมพ์แก้ไขได้ พื้นหลังอมเขียวอ่อน ไม่แสดง focus ring |
| **Disabled** | `#EFEFEF` | `1px solid #E0E0E0` | `#9E9E9E` | `none` | `not-allowed` | Opacity `0.7` ป้องกันการคลิกทับ |

### CSS Implementation Sample สำหรับ Form Fields:
```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5, 6px);
  margin-bottom: var(--space-4);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-label .required-asterisk {
  color: var(--color-error-base);
  margin-left: 2px;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: var(--space-2-5, 10px) var(--space-3);
  font-size: var(--font-size-md);
  font-family: var(--font-family-base);
  color: var(--color-text-primary);
  background-color: var(--color-surface-card);
  border: 1px solid var(--color-primary-100);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--color-primary-600);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.form-input.is-error, .form-select.is-error, .form-textarea.is-error {
  background-color: var(--color-error-bg);
  border-color: var(--color-error-base);
}

.form-input.is-error:focus, .form-select.is-error:focus, .form-textarea.is-error:focus {
  box-shadow: 0 0 0 3px var(--color-error-focus-ring);
}

.form-input:read-only, .form-textarea:read-only {
  background-color: var(--color-primary-25);
  border-color: var(--color-divider);
  color: var(--color-text-secondary);
  cursor: default;
}

.form-input:disabled, .form-select:disabled, .form-textarea:disabled {
  background-color: #EFEFEF;
  border-color: #E0E0E0;
  color: #9E9E9E;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-error-message {
  font-size: var(--font-size-sm);
  color: var(--color-error-text);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

---

## 3. ปุ่มและการจัดลำดับความสำคัญ (Button Hierarchy)

ระบบ UI ใช้ลำดับความสำคัญของปุ่ม 6 รูปแบบ โดยมีปะรำและสไตล์ดังนี้:

| Variant | Background Color | Text / Icon Color | Border | Hover State | Active / Pressed | Focus State | Purpose / Use Case |
|---|---|---|---|---|---|---|---|
| **Primary** | `#006B3C` | `#FFFFFF` | None | Background: `#0B7A46` | Background: `#004D2B` | `0 0 0 3px rgba(0, 107, 60, 0.3)` | ปุ่มการทำงานหลักของหน้า (e.g. Submit Ticket, Save) |
| **Secondary** | `#EAF6EF` | `#006B3C` | `1px solid #006B3C` | Background: `#D1E4D9` | Background: `#A8D0B9` | `0 0 0 3px rgba(0, 107, 60, 0.2)` | ปุ่มทางเลือกหลัก (e.g. Filter, Back, Download) |
| **Tertiary (Ghost)** | Transparent | `#006B3C` | None | Background: `#EAF6EF` | Background: `#D1E4D9` | `0 0 0 3px rgba(0, 107, 60, 0.15)` | ปุ่มการทำงานย่อย (e.g. Clear Filter, Cancel) |
| **Destructive** | `#D32F2F` | `#FFFFFF` | None | Background: `#B71C1C` | Background: `#8E0000` | `0 0 0 3px rgba(211, 47, 47, 0.3)` | ปุ่มการทำงานอันตราย/ลบ (e.g. Remove File) |
| **Disabled** | `#E0E0E0` | `#9E9E9E` | None | No Change | No Change | No Focus Ring | ปิดการทำงาน (e.g. Form invalid / limit reached) |
| **Busy (Loading)** | Same as variant | Text hidden / Opacity 0 | Same as variant | No Change | Pointer-events: none | No Focus Ring | กำลังทำรายการ (มี SVG Spinner หมุนตรงกลาง) |

### CSS Implementation Sample สำหรับ Buttons:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2-5, 10px) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  text-decoration: none;
  line-height: 1.25;
}

.btn-primary {
  background-color: var(--color-primary-700);
  color: var(--color-text-inverse);
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-600);
}
.btn-primary:active:not(:disabled) {
  background-color: var(--color-primary-800);
}

.btn-secondary {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-700);
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-primary-100);
}

.btn-tertiary {
  background-color: transparent;
  color: var(--color-primary-700);
}
.btn-tertiary:hover:not(:disabled) {
  background-color: var(--color-primary-50);
}

.btn-destructive {
  background-color: var(--color-error-base);
  color: var(--color-text-inverse);
}
.btn-destructive:hover:not(:disabled) {
  background-color: var(--color-error-hover);
}

.btn:disabled {
  background-color: #E0E0E0 !important;
  color: #9E9E9E !important;
  border: none !important;
  cursor: not-allowed;
  box-shadow: none !important;
}

.btn-busy {
  position: relative;
  pointer-events: none;
  color: transparent !important;
}
.btn-busy::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-top: -8px;
  margin-left: -8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: btn-spinner 0.6s linear infinite;
}
@keyframes btn-spinner {
  to { transform: rotate(360deg); }
}
```

---

## 4. รายละเอียดทีละหน้าจอ (Screen-by-Screen Layout & Components)

### Global Header / Navigation Bar (มีในทุกหน้า)
- **ตำแหน่ง:** ติดด้านบนสุด (Top Navigation Bar) ความสูง `64px`
- **ซ้ายมือ:** โลโก้ TokTickIT + Tag Badge "Zen Green Theme" (สีเขียว `#006B3C`)
- **ขวามือ:** แผงแสดงตัวตน **Development Requester Selector Bar** (แสดงชื่อ Requester ปัจจุบัน + ปุ่ม "Switch Requester")

---

### Screen 1: Development Requester Selection (`/select-requester`)

#### Layout & Wireframe:
- **โครงสร้าง:** Center-aligned Card Container (ความกว้างสูงสุด `520px` จัดวางกึ่งกลางหน้าจอ)
- **หัวข้อ:** "Development Requester Switcher" (ใช้สำหรับเลือกตัวตนชั่วคราวตามกฎ Lab 2)

```
┌───────────────────────────────────────────────────────────┐
│                 [ TokTickIT Logo ]                        │
│                                                           │
│  Select Active Development Requester                      │
│  Choose a user identity to simulate API requests.         │
│  ───────────────────────────────────────────────────────  │
│                                                           │
│  (•) Jennifer Anderson                                    │
│      jennifer.anderson@example.com   [ Active Badge ]     │
│                                                           │
│  ( ) Michael Brown                                        │
│      michael.brown@example.com                            │
│                                                           │
│  ( ) Sarah Jenkins                                        │
│      sarah.jenkins@example.com                            │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ [ Primary Button: Confirm & Set Active Requester ]  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

#### Field & Component Placement:
1. **Header Description:** ข้อความอธิบายสถานะการทดสอบระบบ (Lab 2 header simulation)
2. **Requester Select Radio List / Select Dropdown:**
   - ข้อมูลดึงมาจาก `GET /api/requesters`
   - แต่ละรายการแสดง Name (`font-weight: 600`), Email (`color: #789082`)
   - รายการที่ถูกเลือกมี Background เป็นสี `--color-primary-50` (`#EAF6EF`) และขอบสี `--color-primary-700`
3. **Primary Action Button:** "Set Active Requester" -> บันทึก id ลงใน State / LocalStorage และแนบเป็น Header `X-Requester-Id` สำหรับทุกๆ API Request

---

### Screen 2: Create Ticket (`/tickets/new`) — Create Mode

#### Layout & Wireframe:
- **โครงสร้าง:** 2-Column Responsive Form Layout บน Desktop (`max-width: 1000px`)
- **ด้านซ้าย (2/3):** ข้อมูลตั๋วหลัก (Ticket Information)
- **ด้านขวา (1/3):** แผงไฟล์แนบ (Attachments Upload Dropzone)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ← Back to My Tickets                                                      │
│ Create New IT Support Ticket                                              │
│ ───────────────────────────────────────────────────────────────────────── │
│                                      │                                    │
│  Category *                          │  Attachments                       │
│  ┌────────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ Select Category             ▼ │  │  │ Drag & Drop file here or     │  │
│  └────────────────────────────────┘  │  │ [ Browse File ]              │  │
│                                      │  │ (JPG, PNG, WEBP, PDF ≤ 5MB) │  │
│  Related System *                    │  └──────────────────────────────┘  │
│  ┌────────────────────────────────┐  │                                    │
│  │ Select Related System       ▼ │  │  Attached Files (0/5)             │  │
│  └────────────────────────────────┘  │  ┌──────────────────────────────┐  │
│                                      │  │ screenshot.png (1.2 MB)  [X] │  │
│  Requested Priority *                │  └──────────────────────────────┘  │
│  ( ) Low   (•) Medium   ( ) High     │                                    │
│                                      │                                    │
│  Summary * (5 - 200 characters)      │                                    │
│  ┌────────────────────────────────┐  │                                    │
│  │ Laptop battery drains quickly  │  │                                    │
│  └────────────────────────────────┘  │                                    │
│  Character count: 29/200             │                                    │
│                                      │                                    │
│  Description * (5 - 2000 chars)      │                                    │
│  ┌────────────────────────────────┐  │                                    │
│  │ My laptop battery is draining  │  │                                    │
│  │ fast even when idle...         │  │                                    │
│  └────────────────────────────────┘  │                                    │
│  Character count: 48/2000            │                                    │
│                                      │                                    │
│ ───────────────────────────────────────────────────────────────────────── │
│ [ Tertiary: Cancel ]              [ Primary Button: Submit Ticket (Busy) ] │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Field Specifications:
1. **Category Dropdown (Required):**
   - Options จาก `GET /api/categories` (`id`, `name`)
2. **Related System Dropdown (Required):**
   - Options จาก `GET /api/related-systems` (`id`, `name`)
3. **Requested Priority Selector (Required):**
   - Radio button group หรือ Segmented Control (`LOW`, `MEDIUM`, `HIGH`) พร้อม Badge สีแสดงผล
4. **Summary Input (Required):**
   - Text input, min length 5, max length 200, มี Character counter ด้านล่างขวา
5. **Description Textarea (Required):**
   - Textarea (min-height `140px`), min length 5, max length 2000, มี Character counter
6. **Attachment Section (Dropzone):**
   - รองรับไฟล์: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`
   - ขนาดสูงสุดไม่เกิน 5MB ต่อไฟล์ และจำนวนไม่เกิน 5 ไฟล์
   - กล่อง Dropzone มีขอบประสีเขียวอ่อน (`border: 2px dashed #A8D0B9`) เมื่อ Drag hover จะเปลี่ยนเป็นสี `#006B3C`
   - แสดงรายการไฟล์ที่เลือกเตรียมอัปโหลด พร้อมปุ่ม Remove [X] (มี Confirmation dialog หากต้องการลบออกก่อนกด Submit)
7. **Action Bar:**
   - ปุ่ม Cancel (Tertiary Button) -> ย้อนกลับไปหน้า My Tickets
   - ปุ่ม Submit Ticket (Primary Button) -> เรียก `POST /api/tickets` จากนั้นส่งไฟล์ทีละไฟล์ผ่าน `POST /api/tickets/:id/attachments`

---

### Screen 3: My Tickets (`/tickets`) — List Mode

#### Layout & Wireframe:
- **โครงสร้าง:** Full-width Container (`max-width: 1200px`)
- **ด้านบน:** Title + ปุ่ม Primary "+ Create Ticket"
- **แผงค้นหาและตัวกรอง (Filter Toolbar):** แถบแนวนอนสำหรับกรองตั๋ว
- **ตารางข้อมูล (Data Table):** แสดงรายการตั๋วของ Requester ปัจจุบัน

```
┌───────────────────────────────────────────────────────────────────────────┐
│ My IT Support Tickets                             [ + Create Ticket ]     │
│ ───────────────────────────────────────────────────────────────────────── │
│                                                                           │
│ [ Search by summary or ticket #... ] [ Category: All ▼ ] [ Priority: All ▼ ] │
│ [ Status: All ▼ ]  [ Sort: Created At ▼ ]  [ Order: DESC ▼ ] [ Clear Filters ]│
│ ───────────────────────────────────────────────────────────────────────── │
│                                                                           │
│ Ticket #      │ Summary               │ Category │ Priority │ Status│ Date│
│ ──────────────┼───────────────────────┼──────────┼──────────┼───────┼─────│
│TKT-2026-000042│Laptop battery drains..│ Hardware │ [MEDIUM] │ [NEW] │22 Aug│
│TKT-2026-000039│Cannot access VPN      │ Network  │ [ HIGH ] │ [NEW] │20 Aug│
│TKT-2026-000012│Request new monitor    │ Hardware │ [ LOW  ] │ [NEW] │15 Aug│
│                                                                           │
│ ───────────────────────────────────────────────────────────────────────── │
│ Items per page: [ 50 ▼ ]                Showing 1 - 3 of 42  [ < ] [ > ]  │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Component Placement:
1. **Search & Filter Bar:**
   - **Search Input:** ค้นหาคำใน `summary` หรือ `ticketNumber` (Real-time / Debounce 300ms)
   - **Category Filter:** Dropdown ตัวเลือกหมวดหมู่
   - **Priority Filter:** Dropdown ตัวเลือก (`LOW`, `MEDIUM`, `HIGH`)
   - **Status Filter:** Dropdown ตัวเลือก (`NEW`, `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
   - **Sorting Controls:** Dropdown เลือกฟิลด์เรียงลำดับ (`createdAt`, `ticketNumber`, `updatedAt`) และทิศทาง (`asc`, `desc`)
   - **Clear Filters Button:** Tertiary button สำหรับรีเซ็ตตัวกรองทั้งหมด
2. **Data Table:**
   - **Table Header:** Background สี `--color-primary-50` (`#EAF6EF`), Font-weight `600`, Text color `#1A2D23`
   - **Table Rows:** Hover state เปลี่ยนสีพื้นหลังเป็น `#F8FBF9`
   - **Priority Badges:**
     - `LOW`: Text `#0288D1`, Bg `#E1F5FE`
     - `MEDIUM`: Text `#ED6C02`, Bg `#FFF4E5`
     - `HIGH`: Text `#C62828`, Bg `#FFEBEE`
   - **Status Badges:**
     - `NEW`: Text `#006B3C`, Bg `#EAF6EF`, Border `#A8D0B9`
   - **Action Column:** ปุ่ม View Details / Link คลิกที่แถวเพื่อไปยัง `/tickets/:id`
3. **Empty State (เมื่อไม่พบข้อมูล):**
   - ไอคอนค้นหา/เอกสารว่างเปล่า
   - ข้อความ: "No tickets found matching your criteria"
   - ปุ่ม "Clear Filters" หรือ "+ Create Ticket"
4. **Pagination Controls Bar:**
   - Page Size Selector Dropdown (ตัวเลือก: 10, 20, 50)
   - Total items & current page text: "Page 1 of 1 (42 items total)"
   - Previous / Next Page navigation buttons

---

### Screen 4: Ticket Detail (`/tickets/:id`) — View Mode

#### Layout & Wireframe:
- **โครงสร้าง:** 2-Column Details Layout (`max-width: 1100px`)
- **คอลัมน์ซ้าย (70%):** รายละเอียดตั๋ว (Header, Summary, Description, Soft-remove confirmation modal)
- **คอลัมน์ขวา (30%):** แผงข้อมูลเมทาดาทาและไฟล์แนบ (Metadata Card & Attachment Manager)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ← Back to Tickets List                                                    │
│ TKT-2026-000042  [ NEW BADGE ]                       Created: 22 Aug 2026 │
│ ───────────────────────────────────────────────────────────────────────── │
│                                           │                               │
│  Summary                                  │  Ticket Metadata              │
│  Laptop battery drains quickly            │  Category: Hardware           │
│                                           │  Related System: Laptop       │
│  Description                              │  Priority: [ MEDIUM ]         │
│  My laptop battery is draining much       │  Requester: Jennifer A.       │
│  faster than usual even when idle...      │  ───────────────────────────  │
│                                           │                               │
│ ───────────────────────────────────────── │  Attachments (2/5)            │
│  Attachments                              │  ┌──────────────────────────┐ │
│  Active Files:                            │  │ 📄 screenshot.png        │ │
│  ┌─────────────────────────────────────┐  │  │ 1.2 MB • Uploaded 22 Aug │ │
│  │ 🖼️ screenshot.png (1.2 MB)           │  │  │ [Download]  [Remove]     │ │
│  │ [ Download Button ]  [ Remove ]     │  │  └──────────────────────────┘ │
│  └─────────────────────────────────────┘  │  ┌──────────────────────────┐ │
│                                           │  │ 📄 report.pdf (Soft Removed)│ │
│  Removed Files History:                   │  │ Reason: Wrong attachment │ │
│  ┌─────────────────────────────────────┐  │  │ (Download Disabled)      │ │
│  │ 📄 report.pdf (800 KB) - REMOVED    │  │  └──────────────────────────┘ │
│  │ Reason: แนบไฟล์ผิด อัปโหลดซ้ำ          │  │                               │
│  └─────────────────────────────────────┘  │  [ + Upload File Button ]     │
└───────────────────────────────────────────────────────────────────────────┘
```

#### Component Placement:
1. **Header Title Section:**
   - Ticket Number (`font-size: 24px`, `font-weight: 700`)
   - Status Badge (`NEW`)
   - Timestamps (Created at & Updated at formatted ISO date)
2. **Main Content Card:**
   - Summary Title (`font-size: 18px`)
   - Description Box (Read-only styled container, preserving line breaks)
3. **Attachment Management Component:**
   - **Active Files List:** แสดงรายการไฟล์ active (มีไอคอนแยกตามประเภทไฟล์: PDF vs Image), แสดงชื่อไฟล์, ขนาดไฟล์ (formatted human readable, e.g. 1.2 MB)
   - **Download Action Button:** Secondary button เรียก `GET /api/attachments/:id/download`
   - **Remove Action Button:** Destructive button สำหรับเริ่มขั้นตอน Soft Removal
4. **Soft Removal Modal Dialog:**
   - เมื่อกด Remove จะเปิด Modal Dialog ถามเหตุผลการลบ
   - Field `removalReason` (Textarea, บังคับพิมพ์อย่างน้อย 5 ตัวอักษร)
   - ปุ่ม Confirm Soft Remove (Destructive Button) -> เรียก `PATCH /api/attachments/:id/remove`
   - ปุ่ม Cancel (Tertiary Button)
5. **Soft-removed Files Display Section:**
   - แสดงไฟล์ที่ถูก Soft-remove ด้วยสไตล์สีเทาจาง (Opaciy `0.6`, Text strikethrough)
   - แสดง Badge "Soft Removed" (สีเทา)
   - แสดงข้อความเหตุผลการลบ `removalReason` และวันที่ลบ
   - ปุ่ม Download ปิดใช้งาน (`disabled`)

---

## 5. การปรับเปลี่ยนตามขนาดหน้าจอ (Responsive Breakpoints)

กำหนด Breakpoint มาตรฐาน 3 ระดับ ดังนี้:

```css
/* Desktop: ≥ 992px */
/* Tablet:  768px - 991px */
/* Mobile:  < 768px */
```

### Layout Transformations per Breakpoint:

| Screen | Desktop (`≥ 992px`) | Tablet (`768px - 991px`) | Mobile (`< 768px`) |
|---|---|---|---|
| **Global Container** | Max-width `1200px`, Margin auto, Padding `24px` | Max-width `100%`, Padding `16px` | Max-width `100%`, Padding `12px` |
| **Header Navigation** | Top Bar ความสูง 64px, แสดง Logo และ Requester Selector ขวามือเต็มรูปแบบ | Top Bar 64px, แสดง Logo + Selector ขนาดกะทัดรัด | Top Bar 56px, แสดง Logo และ Dropdown ตัวตนแบบย่อ |
| **Screen 1: Requester Select** | Modal Box ตรงกลางความกว้าง `520px` | Card ความกว้าง `90%` | Card ความกว้าง `100%`, Full-width Submit button |
| **Screen 2: Create Ticket** | 2-Column Grid Layout (Form 65% / Dropzone 35%) | 1-Column Layout (Form อยู่บน, Dropzone อยู่ล่าง) | 1-Column Layout, Inputs ขนาดเต็ม, Target touch padding `12px` |
| **Screen 3: My Tickets** | Full Data Table แสดงผลครบทุก Column (Ticket#, Summary, Category, Priority, Status, Date) | Data Table ซ่อน Column Date/Category หรือเปิด Horizontal Scroll | แปลง Data Table เป็น **Stacked Cards Layout** (แต่ละตั๋วกลายเป็น Card 1 ใบ) |
| **Screen 4: Ticket Detail** | 2-Column Side-by-side Layout (Main details 70% / Sidebar Metadata 30%) | 1-Column Layout (Main details บน / Attachments ล่าง) | 1-Column Layout, Full-width buttons, Modal dialog เต็มหน้าจอ (Full-screen sheet) |

### Responsive CSS Sample (Table to Cards transformation on Mobile):
```css
@media (max-width: 767px) {
  /* Hide standard table headers */
  .tickets-table thead {
    display: none;
  }
  
  .tickets-table, .tickets-table tbody, .tickets-table tr, .tickets-table td {
    display: block;
    width: 100%;
  }

  .tickets-table tr {
    margin-bottom: var(--space-3);
    background-color: var(--color-surface-card);
    border: 1px solid var(--color-primary-100);
    border-radius: var(--radius-lg);
    padding: var(--space-3);
    box-shadow: var(--shadow-sm);
  }

  .tickets-table td {
    padding: var(--space-1-5) 0;
    border: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tickets-table td::before {
    content: attr(data-label);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .btn {
    width: 100%; /* Full width buttons on mobile */
  }
}
```

---

## 6. พาธและข้อกำหนดสำหรับรูปถ่าย Visual QA (Issue 6 Screenshots)

ในการทำ Visual QA สำหรับ Issue 6 นักศึกษาหรือ AI Agent ต้องถ่ายภาพหน้าจอ UI จริงที่ได้พัฒนาแล้วไปไว้ตาม **Standardized Directory Structure** และชื่อไฟล์ดังต่อไปนี้:

**Directory Path:** `docs/lab-02/qa/screenshots/`

### รายการไฟล์รูปภาพที่ต้องถ่ายส่ง:

```
docs/lab-02/qa/screenshots/
├── 01-requester-select-desktop.png        # หน้าเลือก Requester บน Desktop
├── 01-requester-select-mobile.png         # หน้าเลือก Requester บน Mobile (<768px)
├── 02-create-ticket-desktop.png           # หน้าฟอร์มสร้างตั๋วแบบว่าง บน Desktop
├── 02-create-ticket-filled-desktop.png    # หน้าฟอร์มสร้างตั๋วพร้อมข้อมูลและไฟล์แนบ
├── 02-create-ticket-validation-error.png  # แสดงสถานะ Field Error / Required Validation
├── 02-create-ticket-mobile.png            # หน้าฟอร์มสร้างตั๋วบน Mobile
├── 03-my-tickets-list-desktop.png         # รายการตั๋ว (List View) บน Desktop
├── 03-my-tickets-list-filtered.png        # รายการตั๋วเมื่อเปิดใช้งาน Search & Filters
├── 03-my-tickets-list-empty.png           # รายการตั๋วกรณีไม่พบข้อมูล (Empty State)
├── 03-my-tickets-list-mobile-cards.png    # รายการตั๋วแบบ Cards บน Mobile
├── 04-ticket-detail-desktop.png           # หน้าดูรายละเอียดตั๋ว (View Mode) บน Desktop
├── 04-ticket-detail-attachment-modal.png  # หน้าต่าง Soft-remove Reason Dialog
├── 04-ticket-detail-removed-attachment.png# หน้าแสดงรายการไฟล์ที่ถูก Soft-removed
└── 04-ticket-detail-mobile.png            # หน้าดูรายละเอียดตั๋วบน Mobile
```

### ข้อกำหนดทางเทคนิคของการถ่ายภาพ QA:
1. **Resolution & Scaling:**
   - Desktop screenshot: ความกว้างขั้นต่ำ `1280px`
   - Mobile screenshot: ความกว้างจำลอง `375px` ถึง `414px` (e.g. iPhone Viewport)
2. **Visual Fidelity:**
   - ต้องเห็นธีม **Zen Green** (`#006B3C`, `#EAF6EF`) ชัดเจนในทุกหน้าจอ
   - ต้องเห็น Focus Rings, State Badges (Low/Med/High, New) และ Validation Errors ตามข้อกำหนดในเอกสารนี้อย่างครบถ้วน
