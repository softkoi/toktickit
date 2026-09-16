# Lab 3 UI Specification & Design System Document

## 1. Overview & Zen Green Design System Extensions

Lab 3 extends the **Zen Green** design language established in Lab 2. All screens, cards, forms, tables, modals, and badges maintain visual harmony, accessibility (WCAG 2.1 AA), and responsiveness across Desktop, Tablet, and Mobile viewport sizes.

### 1.1 Color Palette & Tokens
| Token Name | Hex Code / Value | Usage |
| :--- | :--- | :--- |
| `--color-zg-primary` | `#0f5132` (Deep Forest Green) | Headers, Primary Buttons, Active Navigation |
| `--color-zg-primary-hover` | `#0b3d26` | Hover state for Primary Buttons |
| `--color-zg-accent` | `#198754` (Emerald Green) | Success Badges, Accent Highlights |
| `--color-zg-bg-light` | `#f8f9fa` (Off-White) | Page Background |
| `--color-zg-card-bg` | `#ffffff` (Pure White) | Card & Table Container Background |
| `--color-zg-border` | `#dee2e6` (Light Gray) | Borders, Dividers, Card Outlines |
| `--color-zg-text-main` | `#212529` (Dark Charcoal) | Body Text, Table Headers |
| `--color-zg-text-muted` | `#6c757d` (Muted Gray) | Subtitles, Timestamps, Labels |
| `--color-zg-internal-note-bg` | `#fff8e1` (Light Warm Gold) | Internal Note Background Container |
| `--color-zg-internal-note-border`| `#ffe082` (Warm Amber Border) | Internal Note Left Border & Outline |
| `--color-zg-danger` | `#dc3545` (Crimson Red) | Deactivation, Errors, High Priority |
| `--color-zg-warning` | `#ffc107` (Amber Yellow) | Medium Priority, Waiting Status |
| `--color-zg-info` | `#0dcaf0` (Cyan) | Open Status, Informational Badges |

---

## 2. Application Shell & Role Navigation

### 2.1 Header & Navigation Bar
- **Logo**: TokTickIT brand icon and text (linked to role home page).
- **Navigation Links**: Dynamic per authenticated user role:
  - `REQUESTER`: [My Tickets], [Create Ticket]
  - `IT_STAFF`: [Ticket Queue], [Create Ticket]
  - `ADMINISTRATOR`: [User Management], [Ticket Queue]
- **User Identity & Dropdown**:
  - Displays authenticated user's Name and Role Badge (e.g. `[IT Staff]`, `[Admin]`).
  - Dropdown Menu: `[Change Password]`, `[Logout]`.
- **Development Requester Selector**: Removed completely.

---

## 3. Screen Specifications

### 3.1 Login & Mandatory Password Change Screen (`Login.tsx`, `ChangePassword.tsx`)

#### Layout & Controls
- **Login View**:
  - Centered Zen Green card container on `#f8f9fa` background.
  - Inputs: Email Address, Password (with toggle show/hide eye icon).
  - Button: Primary "Sign In" with loading spinner during API request.
  - Validation: Inline error banner for invalid credentials or inactive account.
- **Mandatory Password Change View**:
  - Automatically renders when authenticated user has `mustChangePassword = true`.
  - Notice Banner: "First Login Security Requirement: Please update your password to proceed."
  - Inputs: Current (Initial) Password, New Password, Confirm New Password.
  - Live Validation Checklist:
    - [ ] At least 8 characters
    - [ ] Includes uppercase & lowercase letters
    - [ ] Includes at least one number
    - [ ] Includes at least one special character (`!@#$%^&*`)
  - Button: "Save New Password & Continue".

---

### 3.2 Requester Regression & Public Comments (`RequesterTicketDetail.tsx`)

#### Layout & Controls
- Extends Lab 2 Ticket Detail layout.
- **Public Comments Section**:
  - Chronological list of public messages on the ticket.
  - User avatar/initials, Author Name, Role Badge, Timestamp.
  - Comment input box with "Post Public Comment" button.
- **Resolution Request Action**:
  - Button: "Mark Problem as Resolved" (opens confirmation dialog).
  - Shifts status representation to `WAITING_FOR_REQUESTER` or logs resolution confirmation.
- **Ownership Scoping**: Internal notes tab/box is completely hidden from Requesters.

---

### 3.3 IT Staff Ticket Queue (`StaffTicketQueue.tsx`)

#### Desktop View (Data Table Layout)
- Search Bar (Search by Ticket #, Summary, or Description).
- Filter Controls: Status Dropdown, IT Priority Dropdown, Owner Dropdown.
- Table Columns:
  1. `Ticket No.` (Monospace font, clickable link to detail)
  2. `Created Date` (Formatted string, e.g. `May 12, 2026 09:14 AM`)
  3. `Summary` (Truncated to 1 line with ellipsis)
  4. `Category` (Badge style)
  5. `Requested Priority` (Badge: Low, Medium, High)
  6. `IT Priority` (Editable or Badge: Low, Medium, High)
  7. `Status` (Status pill badge)
  8. `Owner` (Owner name or `[Unassigned]`)
  9. `Actions` (Button: `View Detail`)
- Pagination Bar: Page selection `[1] [2] [3] ... [Next]`, Items per page indicator.

#### Mobile / Tablet View (Responsive Card Grid Layout)
- Viewport width `< 768px` automatically transitions the grid to stacked Zen Green cards.
- Card Header: Ticket # and Status Pill.
- Card Body: Summary, Category, Requested Priority, IT Priority, Owner Name.
- Card Footer: "Open Ticket Detail" full-width tap target.

---

### 3.4 IT Staff Ticket Detail (`StaffTicketDetail.tsx`)

#### Layout & Workflow Controls
- Top Bar: `<- Back to Queue` link, Ticket #, Current Status Badge.
- **Assignment Bar**:
  - Ticket Owner Dropdown (Shows all active IT Staff & Admin users + `[Unassigned]`).
  - Button: `[Claim Ownership]` (Quickly sets current user as owner).
- **Priority & Workflow Control Bar**:
  - IT Priority Dropdown (`LOW`, `MEDIUM`, `HIGH`).
  - Permitted Status Transition Dropdown (Renders only valid next statuses according to state machine).
  - Button: `[Update Status]`.
- **Tabbed Activity Section**:
  - **Tab 1: Public Comments** (Zen Green Theme): Shared communications visible to requester.
  - **Tab 2: Internal Notes** (Amber Warm Theme): Restricted notes for IT Staff & Admins. Clearly displays warning badge: *"Private Internal Note — Not visible to Requester"*.

---

### 3.5 Administrator User Management (`UserManagement.tsx`)

#### Layout & Controls
- Header: Title "User Accounts", Search input (Name or Email), Role Filter dropdown, `[+ Create New User]` button.
- User Table:
  - Columns: `Name`, `Email`, `Role` (Badge), `Status` (`Active` green / `Inactive` gray), `Actions`.
  - Actions Menu: `[Edit User]`, `[Reset Initial Password]`, `[Toggle Active State]`.
- **Create / Edit User Drawer / Modal**:
  - Form Fields: Full Name, Email Address, Single Role Select (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), Active Toggle (`Yes/No`).
  - Initial Password Field (for Create User): Checkbox "Force password change on first login" (Checked by default).
  - Validation: Duplicate email prevention, self-deactivation prevention, last administrator deactivation block.
- **Reset Initial Password Modal**:
  - Field: New Initial Password.
  - Warning: "This will require the user to change their password upon their next login."

---

## 4. Required Screen Modes & Feedback States

| Screen | Mode | Trigger / Condition | Visual Feedback & UX Behavior |
| :--- | :--- | :--- | :--- |
| **Login** | View / Input | Default state | Inputs enabled, focus on email field |
| **Login** | Busy | Form Submit | Button disabled, spinner animation shown |
| **Login** | Error | Invalid Credentials / Inactive Account | Crimson alert box: "Invalid email or password. Please try again." |
| **Queue** | Loading | Initial load or pagination change | Skeleton loading rows in table |
| **Queue** | Empty | No tickets match query filter | Zen Green Empty State graphic: "No tickets found matching criteria." |
| **Ticket Detail** | Edit Mode | Changing Owner / Priority / Status | Dropdown active, "Saving..." inline badge during PATCH API call |
| **Ticket Detail** | Success | Status or Owner updated | Green toast banner: "Ticket updated successfully." |
| **User Admin**| Validation Error | Duplicate Email or Invalid Input | Field-level red error text + top alert banner |
| **User Admin**| Forbidden | Self-deactivation attempt | Warning dialog: "Action forbidden: You cannot deactivate your own active account." |
| **User Admin**| Forbidden | Deactivating Last Administrator | Warning dialog: "Action forbidden: System must retain at least one active Administrator." |

---

## 5. Accessibility & Responsive Breakpoints

- **Breakpoints**:
  - `Mobile`: `< 640px` (Stacked single-column layout, card view for table, drawer modals)
  - `Tablet`: `640px - 1024px` (Two-column card view, adaptive search header)
  - `Desktop`: `> 1024px` (Full table layout, side-by-side ticket detail panels)
- **Accessibility**:
  - Unique HTML element `id` for every input and interactive control.
  - High-contrast color ratios exceeding WCAG AA standards.
  - ARIA attributes for modals (`aria-modal="true"`), role badges, and tabs (`role="tablist"`).
