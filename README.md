# TokTickIT

TokTickIT is the Lab 1 starter for CPE334. It proves the full stack works as one vertical slice:

`React UI -> Express REST API -> Prisma ORM -> PostgreSQL`

## Tech stack

* **Frontend:** React, TypeScript, Vite, Bootstrap
* **Backend:** Node.js, Express, TypeScript
* **Database:** PostgreSQL, Prisma
* **Testing:** Vitest, Supertest

## Repository structure

```text
toktickit/
├── client/
│   ├── index.html
│   ├── public/
│   └── src/
├── server/
│   ├── prisma/
│   ├── tests/
│   └── src/
├── docs/
│   └── lab-01/
│       ├── ai_use.md
│       ├── reviewer.md
│       └── tests.md
├── prisma.config.ts
├── README.md
└── tsconfig.json
```

## Project areas

* **`client/`**: contains the React + Vite frontend.
* **`server/`**: contains the Express + Prisma backend work.
* **`docs/lab-01/`**: stores the lab submission documents.

## Local setup

### 1) Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2) Configure the backend

Create `server/.env` and set the database connection string required by Prisma:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/toktickit_db?schema=public"
```

### 3) Run the frontend & backend

```bash
# Frontend (in client/)
cd client
npm run dev

# Backend (in server/)
cd server
npm run dev
```

### 4) Run checks

The project defines these test scripts:

* `npm run test` (in `server/` to run Vitest + Supertest API tests)
* `npm run test` (in `client/` to run Vitest UI tests)

## Lab documentation

* **`docs/lab-01/ai_use.md`**: records AI usage and prompt notes.
* **`docs/lab-01/reviewer.md`**: records peer review details.
* **`docs/lab-01/tests.md`**: records automated test suite details.

## Lab 1 acceptance summary

* `GET /api/health` returns 200 with `{ "status": "ok", "service": "TokTickIT API" }`
* `GET /api/categories` returns the seeded categories in a stable order
* The UI shows loading, success, and failure states
* The repository keeps the Lab 1 workflow, docs, and tests organized