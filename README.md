# Smart Building System

IT 309 Software Engineering — IBU, Spring 2026

A web application that monitors, controls, and optimizes energy usage in residential
buildings equipped with IoT devices.

**Release 1 — Core System**: dashboard with energy consumption, device list and detail
views, room-based navigation, ON/OFF control, and basic charts.

## Tech stack

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + Recharts + React Router
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: SQLite (local dev); switch to PostgreSQL for deployment
- **Auth**: JWT + bcrypt
- **Testing**: Jest + Supertest (backend), Vitest + React Testing Library (frontend)

## Architectural & design patterns

- **Layered Architecture (n-tier)** — backend organized as `routes → controllers →
  services → repositories → Prisma`. Each layer only talks to the one directly below.
- **Client-Server** — separate frontend (Vite dev server / static build) and backend
  (Express HTTP API).
- **Repository pattern** — data access encapsulated in `src/repositories/*`.
- **Singleton** — single `PrismaClient` instance in `src/db/prisma.ts`.
- **Factory** — device creation logic in `src/utils/deviceFactory.ts`.

## Project structure

```
smart_building/
├── backend/        # Express REST API + Prisma + simulator
└── frontend/       # React SPA
```

## How to run (first time)

You need Node.js v20+ and npm installed.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The API will be available at `http://localhost:4000`.

In a second terminal you can also run the IoT simulator (it adds new readings every 30s
to any device that's currently ON, so the dashboard updates in real time):

```bash
cd backend
npm run simulate
```

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 3. Log in

Open `http://localhost:5173` and sign in with the seeded demo account:

- **Email**: `demo@smartbuilding.test`
- **Password**: `demo1234`

## Useful scripts

### Backend

```bash
npm run dev               # start API in watch mode
npm run build             # tsc → dist/
npm start                 # run compiled build
npm run lint              # eslint
npm run format            # prettier
npm test                  # run jest tests
npm run prisma:studio     # GUI for the database
npm run seed              # reset DB with demo data
npm run simulate          # IoT data simulator
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm test
```

## Switching to PostgreSQL (for deployment)

1. Sign up at [neon.tech](https://neon.tech) (free tier).
2. Create a new project and copy the `DATABASE_URL` connection string.
3. In `backend/prisma/schema.prisma`, change:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. In `backend/.env`, replace `DATABASE_URL` with the Neon connection string.
5. Run `npx prisma migrate deploy` then `npm run seed`.

## Coding standards

- **Backend**: ESLint (TypeScript-ESLint recommended) + Prettier.
- **Frontend**: ESLint (React + TypeScript) + Prettier.
- Run `npm run lint && npm run format` in either folder before committing.
