# Landfello

A Node.js and TypeScript website with a React frontend.

- **Auth:** Firebase Authentication (and Firestore for user profiles)
- **Database:** Supabase Postgres (property listings)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Firebase project (auth)
- A Supabase project (database)

### 1. Create the Supabase table

In the Supabase dashboard → **SQL Editor**, run:

[`supabase/schema.sql`](supabase/schema.sql)

### 2. Environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

Required backend values:

| Variable | Where to find it |
|----------|------------------|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secret) |
| Firebase Admin credentials | Service account JSON for token verification |

For the frontend Firebase client config, copy `frontend/.env.example` to `frontend/.env.local`.

> Never put the Supabase `service_role` key in the frontend. The Express API uses it so Firebase login still protects writes.

### 3. Install & run

```bash
npm run install:all
npm run dev
```

This starts:

- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:5173`

## How property storage works

1. User signs in with **Firebase**
2. Frontend sends property JSON + Firebase Bearer token to `/api/properties`
3. Express verifies the token (Firebase Admin)
4. Property is written to Supabase table `public.properties`

Images are still stored as base64 strings in the `images` text array (same as the old Cosmos setup). You can later move those to Supabase Storage if you want.

## Project Structure

```
├── src/
│   ├── index.ts                 # Express API
│   ├── middleware/auth.ts       # Firebase token verification
│   └── services/supabaseDb.ts   # Supabase property CRUD
├── supabase/
│   └── schema.sql               # Properties table + indexes
├── frontend/
│   └── src/                     # React app
├── .env.example
└── package.json
```

## Available Scripts

- `npm run dev` — backend + frontend
- `npm run dev:backend` — API only
- `npm run dev:frontend` — Vite only
- `npm run build` — production build
- `npm start` — production server
- `npm run install:all` — install all deps
