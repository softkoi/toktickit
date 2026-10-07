# Lab 4 REST API Specification Document: Actions Taken, Dashboards, and Workflow Increments

## 1. Overview & Architecture Standards

### 1.1 Authentication & Security
- **Authentication**: All endpoints inherit session authentication via HTTP-only cookie (`toktickit_session`).
- **Authorization**: Enforced at backend middleware level according to user roles: `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`.
- **Content Type**: `application/json` for all request and response payloads.

### 1.2 Standard Error Response Payload
All errors return a standardized JSON structure:
```json
{
  "error": {
    "code": "UNAUTHORIZED | FORBIDDEN | INVALID_INPUT | NOT_FOUND | CONFLICT | INTERNAL_ERROR",
    "message": "Human-readable description of error",
    "details": null
  }
}
```

### 1.3 Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure or missing required fields.
- `401 Unauthorized`: Session missing or expired.
- `403 Forbidden`: Authenticated user lacks permission for target resource.
- `404 Not Found`: Ticket or Action Taken does not exist.
- `409 Conflict`: Stale update / optimistic concurrency collision detected.
- `500 Internal Server Error`: Unexpected server failure.

---

## 2. Actions Taken Endpoints

### 2.1 Get Actions Taken for a Ticket
Retrieve all logged actions taken for a specified Ticket.

- **Endpoint**: `GET /api/tickets/:id/actions-taken`
- **Access**: 
  - `REQUESTER`: Allowed ONLY if Ticket is owned by the authenticated Requester.
  - `IT_STAFF` / `ADMINISTRATOR`: Allowed for all accessible Tickets.
- **Response (200 OK)**:
```json
{
  "actionsTaken": [
    {
      "id": "act-101",
      "ticketId": "tkt-001",
      "description": "Inspected power supply unit and replaced faulty capacitor.",
      "result": "System powered on successfully during 15-min stress test.",
      "performedBy": {
        "id": "usr-staff-1",
        "name": "Alex Rivers",
        "email": "alex.rivers@toktickit.com",
        "role": "IT_STAFF"
      },
      "followUpRequired": true,
      "followUpNote": "Check temperature levels again tomorrow at 10:00 AM.",
      "attachmentNotes": "See thermal image photo in attachments.",
      "createdAt": "2026-10-07T10:15:00.000Z",
      "updatedAt": "2026-10-07T10:15:00.000Z"
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Authentication session required.
  - `403 Forbidden`: Requester trying to view another user's Ticket actions.
  - `404 Not Found`: Ticket ID does not exist.

---

### 2.2 Create Action Taken
Record a new action taken entry under a Ticket.

- **Endpoint**: `POST /api/tickets/:id/actions-taken`
- **Access**: `IT_STAFF`, `ADMINISTRATOR` (Requesters return `403 Forbidden`).
- **Request Body**:
```json
{
  "description": "Reinstalled graphics driver and updated BIOS.",
  "result": "Display artifacts resolved.",
  "followUpRequired": true,
  "followUpNote": "Monitor user feedback over 24 hours.",
  "attachmentNotes": "Driver version 535.12 logged."
}
```
- **Validation Rules**:
  - `description`: String (Min 3 characters, required).
  - `result`: String (Min 3 characters, required).
  - `followUpRequired`: Boolean (Required).
  - `followUpNote`: Required string (Min 3 characters) if `followUpRequired == true`.
- **Response (201 Created)**:
```json
{
  "actionTaken": {
    "id": "act-102",
    "ticketId": "tkt-001",
    "description": "Reinstalled graphics driver and updated BIOS.",
    "result": "Display artifacts resolved.",
    "performedBy": {
      "id": "usr-staff-2",
      "name": "Jordan Smith",
      "email": "jordan.smith@toktickit.com",
      "role": "IT_STAFF"
    },
    "followUpRequired": true,
    "followUpNote": "Monitor user feedback over 24 hours.",
    "attachmentNotes": "Driver version 535.12 logged.",
    "createdAt": "2026-10-07T11:30:00.000Z",
    "updatedAt": "2026-10-07T11:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `followUpRequired` is true but `followUpNote` is empty.
  - `403 Forbidden`: Requester attempts to create an action.
  - `404 Not Found`: Ticket ID does not exist.

---

### 2.3 Update Action Taken
Update an existing Action Taken record.

- **Endpoint**: `PUT /api/actions-taken/:actionId`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Request Body**:
```json
{
  "description": "Reinstalled graphics driver and updated BIOS to v2.4.",
  "result": "Display artifacts completely resolved after benchmark test.",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "Driver logs attached."
}
```
- **Response (200 OK)**:
```json
{
  "actionTaken": {
    "id": "act-102",
    "ticketId": "tkt-001",
    "description": "Reinstalled graphics driver and updated BIOS to v2.4.",
    "result": "Display artifacts completely resolved after benchmark test.",
    "performedBy": {
      "id": "usr-staff-2",
      "name": "Jordan Smith",
      "email": "jordan.smith@toktickit.com",
      "role": "IT_STAFF"
    },
    "followUpRequired": false,
    "followUpNote": null,
    "attachmentNotes": "Driver logs attached.",
    "createdAt": "2026-10-07T11:30:00.000Z",
    "updatedAt": "2026-10-07T12:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `403 Forbidden`: Requester role attempts edit.
  - `404 Not Found`: Action Taken ID does not exist.

---

## 3. Dashboard Endpoints

### 3.1 Get Requester Dashboard Data
Returns operational summary metrics and recent Tickets for the authenticated Requester.

- **Endpoint**: `GET /api/dashboard/requester`
- **Access**: `REQUESTER` (Also accessible by `IT_STAFF`/`ADMIN` for testing)
- **Response (200 OK)**:
```json
{
  "metrics": {
    "totalOpenTickets": 3,
    "inProgressTickets": 2,
    "resolvedTickets": 5,
    "closedTickets": 12
  },
  "recentTickets": [
    {
      "id": "tkt-001",
      "ticketNumber": "TKT-2026-001234",
      "summary": "Laptop battery drains quickly",
      "status": "IN_PROGRESS",
      "updatedAt": "2026-10-07T09:14:00.000Z"
    },
    {
      "id": "tkt-002",
      "ticketNumber": "TKT-2026-001222",
      "summary": "Request software access",
      "status": "RESOLVED",
      "updatedAt": "2026-10-06T14:30:00.000Z"
    }
  ]
}
```

---

### 3.2 Get IT Staff Dashboard Data
Returns comprehensive queue metrics and recent/urgent Tickets for IT Staff and Administrators.

- **Endpoint**: `GET /api/dashboard/staff`
- **Access**: `IT_STAFF`, `ADMINISTRATOR`
- **Response (200 OK)**:
```json
{
  "metrics": {
    "newCount": 14,
    "openCount": 23,
    "inProgressCount": 18,
    "waitingForRequesterCount": 7,
    "myAssignedCount": 16,
    "unassignedCount": 10,
    "userAccountsCount": 42
  },
  "recentTickets": [
    {
      "id": "tkt-001",
      "ticketNumber": "TKT-2026-001234",
      "summary": "Laptop battery drains quickly",
      "status": "IN_PROGRESS",
      "itPriority": "HIGH",
      "updatedAt": "2026-10-07T09:14:00.000Z",
      "assignedTo": {
        "id": "usr-staff-1",
        "name": "Alex Rivers"
      }
    }
  ]
}
```

---

## 4. Ticket Status Workflow & Concurrency Control

### 4.1 Status Transition Endpoint Increment
- **Endpoint**: `PATCH /api/tickets/:id/status`
- **Access**: `IT_STAFF`, `ADMINISTRATOR` for formal resolution/closure. Requesters are restricted to advisory inputs.
- **Request Body**:
```json
{
  "status": "RESOLVED",
  "lastKnownUpdatedAt": "2026-10-07T09:14:00.000Z"
}
```
- **Concurrency Protection (`409 Conflict`)**:
  If the Ticket's actual `updatedAt` on the backend is newer than `lastKnownUpdatedAt`, the API rejects the update:
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "This ticket has been updated by another user. Please refresh and try again.",
    "details": {
      "currentUpdatedAt": "2026-10-07T09:20:15.000Z"
    }
  }
}
```

### 4.2 Requester Advisory Resolution Endpoint
- **Endpoint**: `POST /api/tickets/:id/advisory-resolve`
- **Access**: `REQUESTER` (Ticket Owner)
- **Request Body**:
```json
{
  "note": "The laptop seems to be working fine now."
}
```
- **Behavior**: Does NOT set status to `RESOLVED` directly. Creates a public comment or advisory flag notifying IT Staff that the requester considers the issue fixed. Returns `200 OK`.
