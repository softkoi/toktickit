# Lab 4 UI Specification & Design System Document: Dashboards, Actions Taken, and Polish

## 1. Overview & Zen Green Design System Extensions

Lab 4 extends the **Zen Green** design language to support operational dashboards, Actions Taken parent-child management, and formal resolution workflow feedback.

### 1.1 Color Tokens & Component Styling
| Token Name | Hex Code / Value | Usage |
| :--- | :--- | :--- |
| `--color-zg-primary` | `#0f5132` (Deep Forest Green) | Header Navigation, Active Tabs, Primary Action Buttons |
| `--color-zg-primary-hover` | `#0b3d26` | Primary Button Hover & Active States |
| `--color-zg-accent` | `#198754` (Emerald Green) | Success Badges, Resolved Metrics, Action Completed State |
| `--color-zg-bg-light` | `#f8f9fa` (Off-White) | Application Shell Background |
| `--color-zg-card-bg` | `#ffffff` (Pure White) | Dashboard Metric Cards, Action Taken Panel |
| `--color-zg-card-hover` | `#f1f3f5` | Hover state for clickable metric cards |
| `--color-zg-border` | `#dee2e6` (Light Gray) | Card Outlines, Form Input Borders |
| `--color-zg-action-bg` | `#e8f5e9` (Soft Light Mint) | Actions Taken Timeline Item Background |
| `--color-zg-action-border` | `#a5d6a7` (Mint Green Border) | Left Accent Border for Action Taken Items |
| `--color-zg-warning` | `#ffc107` (Amber Yellow) | Waiting for Requester Badge, Follow-Up Flag Indicator |
| `--color-zg-danger` | `#dc3545` (Crimson Red) | High Priority, Cancelled Status, Validation Errors |
| `--color-zg-info` | `#0dcaf0` (Cyan Blue) | New / Open Status Pill Badges |

---

## 2. Navigation Bar Increments

- **Header Navigation Bar**:
  - Logo & Brand Title: `TokTickIT`
  - Active Page Indication: Underline highlight and active green pill background on the current page link.
  - Role-Based Navigation Items:
    - `REQUESTER`: `[Dashboard]` (Active default), `[My Tickets]`, `[Create Ticket]`
    - `IT_STAFF`: `[Dashboard]` (Active default), `[Ticket Queue]`, `[Create Ticket]`
    - `ADMINISTRATOR`: `[Dashboard]`, `[Ticket Queue]`, `[User Management]`, `[Create Ticket]`

---

## 3. Detailed Screen Specifications

### 3.1 IT Staff & Administrator Dashboard Screen (`StaffDashboard.tsx`)

#### Layout & Hierarchy
- **Page Header**: Welcome message with current user's name (e.g. "Welcome back, Michael!") and Refresh button.
- **Top Metric Cards Grid (5-column Desktop, 2-column Tablet, 1-column Mobile)**:
  1. `New`: Count of new tickets + indicator compared to baseline.
  2. `Open`: Count of open tickets.
  3. `In Progress`: Count of active in-progress tickets.
  4. `Waiting for Requester`: Count of tickets pending requester input.
  5. `My Assigned`: Count of tickets assigned to current user.
  - **Drill-down behavior**: Clicking any metric card redirects to `/tickets` pre-filtered by that specific status or assignee.
- **Bottom Split View**:
  - **Left Section (70% Desktop)**: `My Recent Tickets` table/card list displaying Ticket #, Summary, Status Pill Badge, Updated Timestamp, and direct link to Ticket Detail.
  - **Right Section (30% Desktop)**: `Quick Actions` grid containing:
    - `+ Create Ticket` button
    - `🔍 Search Tickets` button
    - `📋 My Queue` button

---

### 3.2 Requester Dashboard Screen (`RequesterDashboard.tsx`)

#### Layout & Hierarchy
- **Page Header**: Personal welcome banner (e.g. "Welcome, Jennifer! Here's the latest on your requests.").
- **Top Metric Cards Grid (4-column Desktop, 2-column Mobile)**:
  1. `My Open Tickets`: Count of active open tickets owned by requester.
  2. `In Progress`: Count of tickets currently being worked on.
  3. `Resolved`: Count of resolved tickets pending final closure.
  4. `Closed`: Count of completed tickets.
  - **Drill-down behavior**: Clicking "View all" on any card opens `/my-tickets` filtered by status.
- **Bottom Split View**:
  - **Left Section**: `My Recent Tickets` card list showing Ticket #, Summary, Status Badge, Last Updated Date.
  - **Right Section**: `Quick Actions` panel with prominent `+ Create Ticket` and `📋 View My Tickets` buttons.

---

### 3.3 Actions Taken UI on Ticket Detail Page (`ActionsTakenSection.tsx`)

#### Layout & Components
- **Location**: Rendered as a dedicated tab/panel on the Ticket Detail screen under the main Ticket description.
- **Actions Taken Timeline List**:
  - Chronological cards for each action entry.
  - Header: Action Date/Time timestamp, `Performed by: [Staff Name]` badge.
  - Body: **Description** (what was done) and **Result** (outcome).
  - Flags: `Follow-Up Required` badge (Amber) with `Follow-up Note`, `Attachment Notes` badge with file guidance.
- **Add / Edit Action Taken Form (For IT Staff & Admin)**:
  - Collapsible container or modal with title `+ Record New Action Taken`.
  - Input Fields:
    - `Action Description` (Textarea, required)
    - `Result / Outcome` (Textarea, required)
    - `Follow-Up Required?` (Checkbox toggle)
    - `Follow-up Note` (Textarea, conditionally required when checkbox is checked, with inline red error message if empty)
    - `Attachment Notes` (Optional input)
  - Buttons: `Save Action Taken` (Primary Green) and `Cancel`.
- **Requester View Mode**:
  - Full timeline list is visible to Requester on owned tickets.
  - "Add Action Taken" and "Edit" controls are completely hidden/removed from DOM for Requester role.

---

## 4. Responsive Design Breakpoints

| Viewport Category | Screen Width | Layout & Component Behavior |
| :--- | :--- | :--- |
| **Desktop** | `≥ 1024px` | Full multi-column dashboard grid (5-column metrics), side-by-side split panels, expanded tables. |
| **Tablet** | `768px - 1023px` | 2-column metric cards grid, stacked split views, compact table view. |
| **Mobile** | `< 768px` | 1-column vertical metric card stack, touch-friendly tap targets (min 44px height), collapsible action forms. |

---

## 5. Component States & Feedback

- **Loading State**: Zen Green skeleton pulsing cards during API fetch.
- **Empty State**: Friendly illustration/icon with text "No actions taken recorded yet." or "No tickets found."
- **Error State**: Non-blocking toast/alert notification bar displaying error message with retry option.
- **Forbidden State**: Clean 403 screen with "Access Restricted" message and button to return to Dashboard.

---

## 6. Accessibility & Usability (WCAG 2.1 AA)

- **Keyboard Focus**: Visible 2px green focus ring (`outline: 2px solid var(--color-zg-primary)`) on all interactive buttons, cards, and inputs.
- **ARIA Attributes**: `aria-expanded` for collapsible action forms, `aria-live="polite"` for metric updates.
- **Color Independence**: Status badges rely on both distinct background colors AND clear text labels + icons.
