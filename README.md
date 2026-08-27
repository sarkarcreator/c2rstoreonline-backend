# C2R Store Online Backend

NestJS REST API for C2R Store Online. It owns PostgreSQL via Prisma, admin authentication/RBAC, data management, affiliate redirects and click tracking, contact/newsletter submissions, rate limits, and Gemini calls.

## Setup

1. Copy `.env.example` to `.env` and set a PostgreSQL `DATABASE_URL`, a 32+ character `JWT_SECRET`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Run `npm install`, `npx prisma generate`, and `npx prisma migrate dev --name init`.
3. Seed source data with `npx prisma db seed`.
4. Start with `npm run dev` on port 4000.

`GEMINI_API_KEY` is required only for `/api/ai/generate`; it never belongs in the frontend. Production rejects missing `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL`, and CORS permits only `ALLOWED_ORIGINS`/`FRONTEND_URL`.

## API

Public: `/api/tools`, `/api/categories`, `/api/comparisons`, `/api/deals`, `/api/guides`, `/api/free-tools`, `/api/search`, `/api/newsletter/subscribe`, `/api/contact`, `/api/ai/generate`, and `/api/go/:slug`.

Admin: `/api/admin/auth/login`, `/api/admin/auth/logout`, `/api/admin/auth/session`, `/api/admin/stats`, and `/api/admin/tools`.

## Checks

Run `npx prisma validate`, `npx prisma generate`, `npm run lint`, `npm test`, and `npm run build`.
