# Lab 3 REST API Specification Document

## 1. Authentication & Session Architecture

### 1.1 Session Storage & Cookie Policy
- **Authentication Strategy**: Cookie-based HTTP-Only Session (`toktickit_session`).
- **Cookie Security**:
  - `HttpOnly`: `true` (Prevents client-side XSS script access to session token).
  - `SameSite`: `Lax` / `Strict` (Protects against Cross-Site Request Forgery - CSRF).
  - `Secure`: `true` in production (Enforces HTTPS transport).
- **Password Hashing**: Passwords are hashed using `bcrypt` (salt rounds = 10). Plaintext passwords are never logged or returned.

### 1.2 Common Error Response Format
All API errors return a standard JSON payload:
```json
{
  "error": {
    "code": "UNAUTHORIZED | FORBIDDEN | INVALID_INPUT | NOT_FOUND | CONFLICT | INTERNAL_ERROR",
    "message": "Human-readable error description",
    "details": null
  }
}
```

---

## 2. Authentication Endpoints

### 2.1 Login User
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "staff1@toktickit.com",
  "password": "Password123!"
}
```
- **Response (200 OK)**:
```json
{
  "user": {
    "id": 2,
    "name": "Sarah Connor",
    "email": "staff1@toktickit.com",
    "role": "IT_STAFF",
    "mustChangePassword": false,
    "isActive": true
  }
}
```
- **Errors**:
  - `401 Unauthorized`: Invalid credentials or inactive account (`isActive = false`).

---

### 2.2 Logout User
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated users
- **Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

### 2.3 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated users
- **Response (200 OK)**:
```json
{
  "user": {
    "id": 2,
    "name": "Sarah Connor",
    "email": "staff1@toktickit.com",
    "role": "IT_STAFF",
    "mustChangePassword": false,
    "isActive": true
  }
}
```
- **Errors**: `401 Unauthorized` if no active session cookie exists.

---

### 2.4 Change Password (Mandatory or Voluntary)
- **Endpoint**: `POST /api/auth/change-password`
- **Access**: Authenticated users
- **Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePassword456!"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Password changed successfully",
  "user": {
    "id": 2,
    "mustChangePassword": false
  }
}
```
- **Errors**:
  - `400 Bad Request`: Password rules failed (min 8 chars, upper/lower/number/special char) or current password incorrect.

---

## 3. IT Staff Queue & Workflow Endpoints

### 3.1 Get Ticket Queue (IT Staff & Administrator)
- **Endpoint**: `GET /api/staff/tickets`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Query Parameters**:
  - `search` (optional string): Matches ticketNumber, summary, or description.
  - `status` (optional string): Filter by status (`NEW`, `OPEN`, `IN_PROGRESS`, etc.).
  - `priority` (optional string): Filter by IT Priority (`LOW`, `MEDIUM`, `HIGH`).
  - `ownerId` (optional number): Filter by owner ID (or `unassigned`).
  - `sortBy` (optional string): `createdAt` | `updatedAt` | `itPriority` | `ticketNumber`.
  - `sortOrder` (optional string): `asc` | `desc` (default: `desc`).
  - `page` (optional number, default: 1).
  - `pageSize` (optional number, default: 10).
- **Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 101,
      "ticketNumber": "TXT-2026-001234",
      "summary": "Laptop battery drains quickly",
      "requestedPriority": "MEDIUM",
      "itPriority": "MEDIUM",
      "currentStatus": "IN_PROGRESS",
      "createdAt": "2026-05-12T09:14:00Z",
      "updatedAt": "2026-05-12T10:30:00Z",
      "requester": {
        "id": 5,
        "name": "Jennifer Anderson",
        "email": "jennifer@toktickit.com"
      },
      "owner": {
        "id": 2,
        "name": "Michael Brown",
        "role": "IT_STAFF"
      },
      "category": { "id": 1, "name": "Hardware" },
      "relatedSystem": { "id": 3, "name": "Corporate Laptop" }
    }
  ],
  "pagination": {
    "total": 87,
    "page": 1,
    "pageSize": 10,
    "totalPages": 9
  }
}
```

---

### 3.2 Get Single Ticket Detail for IT Staff
- **Endpoint**: `GET /api/staff/tickets/:id`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Response (200 OK)**: Returns complete ticket details including requester info, owner info, category, system, attachments list, public comments count, and internal notes count.

---

### 3.3 Claim Ticket Ownership
- **Endpoint**: `PATCH /api/staff/tickets/:id/claim`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Response (200 OK)**: Sets `ownerId = currentUser.id`.

---

### 3.4 Assign or Reassign Ticket Ownership
- **Endpoint**: `PATCH /api/staff/tickets/:id/assign`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
```json
{
  "ownerId": 3
}
```
- **Response (200 OK)**: Updates `ownerId` to target user (must be active `IT_STAFF` or `ADMINISTRATOR`).

---

### 3.5 Update IT Priority
- **Endpoint**: `PATCH /api/staff/tickets/:id/priority`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
```json
{
  "itPriority": "HIGH"
}
```
- **Response (200 OK)**: Updates `itPriority`.

---

### 3.6 Update Ticket Status
- **Endpoint**: `PATCH /api/staff/tickets/:id/status`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
```json
{
  "status": "RESOLVED"
}
```
- **Response (200 OK)**: Updates `currentStatus` if valid per status transition matrix.
- **Errors**: `400 Bad Request` if invalid state transition.

---

### 3.7 Requester Resolution Request
- **Endpoint**: `POST /api/tickets/:id/resolve-request`
- **Access**: `REQUESTER` (Must own the ticket)
- **Response (200 OK)**: Sets status to `WAITING_FOR_REQUESTER` or logs resolution request confirmation.

---

## 4. Public Comments & Internal Notes Endpoints

### 4.1 Get Public Comments
- **Endpoint**: `GET /api/tickets/:id/comments`
- **Access**: Requester (ticket owner), `IT_STAFF`, `ADMINISTRATOR`
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "ticketId": 101,
    "content": "We are investigating the issue on your device.",
    "createdAt": "2026-05-12T10:30:00Z",
    "author": {
      "id": 2,
      "name": "Michael Brown",
      "role": "IT_STAFF"
    }
  }
]
```

---

### 4.2 Create Public Comment
- **Endpoint**: `POST /api/tickets/:id/comments`
- **Access**: Requester (ticket owner), `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
```json
{
  "content": "Thank you for the update. Please let me know if you need additional details."
}
```
- **Response (201 Created)**: Returns created comment object.

---

### 4.3 Get Internal Notes
- **Endpoint**: `GET /api/staff/tickets/:id/notes`
- **Access**: `IT_STAFF`, `ADMINISTRATOR` ONLY (Requesters receive `403 Forbidden`)
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "ticketId": 101,
    "content": "Battery health check indicates hardware fault. Replacement unit ordered.",
    "createdAt": "2026-05-12T10:35:00Z",
    "author": {
      "id": 2,
      "name": "Michael Brown",
      "role": "IT_STAFF"
    }
  }
]
```

---

### 4.4 Create Internal Note
- **Endpoint**: `POST /api/staff/tickets/:id/notes`
- **Access**: `IT_STAFF`, `ADMINISTRATOR` ONLY
- **Request Body**:
```json
{
  "content": "Vendor warranty claim submitted."
}
```
- **Response (201 Created)**: Returns created internal note object.

---

## 5. Administrator User Management Endpoints

### 5.1 List Users
- **Endpoint**: `GET /api/admin/users`
- **Access**: `ADMINISTRATOR` ONLY
- **Query Parameters**: `search` (name or email), `role` (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`), `page`, `pageSize`.
- **Response (200 OK)**: Returns list of user objects with role and active status.

---

### 5.2 Create User Account
- **Endpoint**: `POST /api/admin/users`
- **Access**: `ADMINISTRATOR` ONLY
- **Request Body**:
```json
{
  "name": "Alex Thompson",
  "email": "alex.thompson@toktickit.com",
  "role": "IT_STAFF",
  "isActive": true,
  "initialPassword": "Password123!",
  "mustChangePassword": true
}
```
- **Response (201 Created)**: Returns created user profile.
- **Errors**: `409 Conflict` for duplicate email.

---

### 5.3 Edit User Account
- **Endpoint**: `PATCH /api/admin/users/:id`
- **Access**: `ADMINISTRATOR` ONLY
- **Request Body**:
```json
{
  "name": "Alex Thompson Updated",
  "email": "alex.t@toktickit.com",
  "role": "IT_STAFF",
  "isActive": false
}
```
- **Errors**:
  - `400 Bad Request`: Self-deactivation attempt or removing last active administrator.
  - `409 Conflict`: Duplicate email address.

---

### 5.4 Set New Initial Password
- **Endpoint**: `POST /api/admin/users/:id/reset-password`
- **Access**: `ADMINISTRATOR` ONLY
- **Request Body**:
```json
{
  "newInitialPassword": "TemporaryPassword123!"
}
```
- **Response (200 OK)**: Updates password hash and sets `mustChangePassword = true`.

---

## 6. HTTP Status Code Summary Table

| Code | Status Name | Description / Scenario |
| :--- | :--- | :--- |
| **200** | OK | Successful GET, PATCH, or POST password change |
| **201** | Created | Successful creation of User, Comment, or Note |
| **400** | Bad Request | Validation failure, invalid status transition, self-deactivation attempt |
| **401** | Unauthorized | Unauthenticated user or invalid login credentials |
| **403** | Forbidden | Role/ownership check failed (e.g. Requester calling Admin/Notes API) |
| **404** | Not Found | Target resource does not exist (safely handled without leaking info) |
| **409** | Conflict | Duplicate user email registration or update |
| **500** | Internal Error | Unhandled backend exception |
