# C2R Store Online Backend

NestJS REST API for C2R Store Online. It owns MySQL via Prisma, admin authentication/RBAC, data management, affiliate redirects and click tracking, contact/newsletter submissions, rate limits, and Gemini calls.

## Setup

1. Copy `.env.example` to `.env` and set a MySQL `DATABASE_URL`, a 32+ character `JWT_SECRET`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. The URL format is `mysql://USERNAME:PASSWORD@HOST:3306/DATABASE`; URL-encode special password characters (for example, `@` as `%40`).
2. Run `npm install` and `npm run prisma:generate`.
3. This repository has no Prisma migrations. Before seeding a new, empty database, apply the schema deliberately with `npx prisma db push`; do not run this automatically during deployment. For an existing database, first back it up and inspect it with `npx prisma db pull` before deciding on schema changes.
4. Seed source data with `npx prisma db seed` only when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are intentionally configured.
5. Start with `npm run dev` on port 4000.

`GEMINI_API_KEY` is required only for `/api/ai/generate`; it never belongs in the frontend. Production rejects missing `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL`, and CORS permits only `ALLOWED_ORIGINS`/`FRONTEND_URL`.

## API

Public: `/api/tools`, `/api/categories`, `/api/comparisons`, `/api/deals`, `/api/guides`, `/api/free-tools`, `/api/search`, `/api/newsletter/subscribe`, `/api/contact`, `/api/ai/generate`, and `/api/go/:slug`.

Admin: `/api/admin/auth/login`, `/api/admin/auth/logout`, `/api/admin/auth/session`, `/api/admin/stats`, and `/api/admin/tools`.

## Checks

Run `npx prisma validate`, `npx prisma generate`, `npm run lint`, `npm test`, and `npm run build`.
