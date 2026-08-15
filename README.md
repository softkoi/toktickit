# TokTickIt Project

A full-stack web application built with React, Express, TypeScript, Bootstrap, Vitest, Supertest, and Prisma (PostgreSQL).

## Project Structure

```
toktickit/
├── client/              # Frontend (React + TypeScript + Vite + Bootstrap)
│   ├── src/             # React application source code
│   │   ├── test/        # Vitest setup
│   │   ├── App.tsx      # Root React component
│   │   └── main.tsx     # Application entrypoint
│   └── package.json
├── server/              # Backend (Node.js + Express + TypeScript + Prisma)
│   ├── prisma/          # Prisma schema and migrations
│   ├── src/             # Express server source code
│   │   ├── app.ts       # Express app setup
│   │   ├── index.ts     # Server entrypoint
│   │   └── app.test.ts  # Supertest API tests
│   └── package.json
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore configuration
└── README.md            # Project documentation
```

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Environment Configuration
Copy `.env.example` to `.env` or create `.env` files in root / server directory:
```bash
# Set your DATABASE_URL in server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/toktickit_db?schema=public"
```

### 2. Frontend Setup (client)
```bash
cd client
npm install
npm run dev        # Run frontend dev server on http://localhost:5173
npm run test       # Run client tests using Vitest
```

### 3. Backend Setup (server)
```bash
cd server
npm install
npm run dev        # Run backend dev server on http://localhost:5000
npm run test       # Run server tests using Vitest & Supertest
```

### 4. Database Setup (Prisma)
```bash
cd server
npx prisma db push # Push schema to database
```

## Testing
- **Client Tests**: Vitest with `@testing-library/react` and `jsdom`
- **Server Tests**: Vitest with `supertest` for API endpoint verification