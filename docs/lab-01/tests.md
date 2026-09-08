# Lab 1 Automated Tests

All test files are located under `tests/lab-01/` (server) and `src/` (client).

## Test Summary

| Test ID | Test File | Tool | Test Description | Status |
| :--- | :--- | :--- | :--- | :---: |
| **API-01** | `tests/lab-01/health.test.ts` | Supertest | Health endpoint returns 200 and expected JSON | ✅ Pass |
| **API-02** | `tests/lab-01/categories.test.ts` | Supertest | Categories endpoint returns the four seeded categories | ✅ Pass |
| **UI-01** | `src/App.test.tsx` | Vitest | TokTickIT heading renders | ✅ Pass |
| **UI-02** | `src/App.test.tsx` | Vitest | Loading state changes to category list | ✅ Pass |
| **UI-03** | `src/App.test.tsx` | Vitest | API failure displays a useful error message | ✅ Pass |

---

## API Tests (Server — Supertest)

### API-01: Health endpoint returns 200 and expected JSON

* **File:** `server/tests/lab-01/health.test.ts`
* **Tool:** Supertest
* **Description:** Sends a `GET /api/health` request and verifies:
  * HTTP status code is `200`
  * Response body equals `{ "status": "ok", "service": "TokTickIT API" }`

### API-02: Categories endpoint returns the four seeded categories

* **File:** `server/tests/lab-01/categories.test.ts`
* **Tool:** Supertest
* **Description:** Sends a `GET /api/categories` request and verifies:
  * HTTP status code is `200`
  * Response body is an array with more than 0 items
  * Each item contains `id` (Number) and `name` (String)
  * The category names are exactly `["Account and Access", "Hardware", "Software", "Network"]` in order

---

## UI Tests (Client — Vitest)

### UI-01: TokTickIT heading renders

* **File:** `client/src/App.test.tsx`
* **Tool:** Vitest + React Testing Library
* **Description:** Renders the `<App />` component and verifies that the heading `"TokTickIT IT Service Desk"` is present in the document on page load, before any button is clicked.

### UI-02: Loading state changes to category list

* **File:** `client/src/App.test.tsx`
* **Tool:** Vitest + React Testing Library
* **Description:** Mocks `fetch` to return a successful health response and a list of four categories. Clicks the `[Check System]` button and verifies:
  * `"Supported Request Categories"` heading appears
  * Category names such as `"Account and Access"` and `"Hardware"` are displayed

### UI-03: API failure displays a useful error message

* **File:** `client/src/App.test.tsx`
* **Tool:** Vitest + React Testing Library
* **Description:** Mocks `fetch` to reject with a network error. Clicks the `[Check System]` button and verifies that the message `"Unable to connect to TokTickIT API"` is displayed to the user.
