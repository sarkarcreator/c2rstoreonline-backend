# C2R Store Online Backend

Next.js 15 API backend for C2R Store Online. It keeps the existing MySQL/Prisma data model and API contracts while replacing the NestJS runtime with lightweight Next.js route handlers.

## Setup

1. Copy `.env.example` to `.env` and configure `DATABASE_URL`, a 32+ character `JWT_SECRET`, `FRONTEND_URL`, `ALLOWED_ORIGINS`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
2. Run `npm install` and `npm run prisma:generate`.
3. This repository has no Prisma migrations. For a new empty database, deliberately run `npx prisma db push`; do not run it automatically in deployment. For an existing database, back it up and inspect it before changing the schema.
4. Seed with `npm run prisma:seed` only when the admin credentials are intentionally configured.
5. Run `npm run dev`. The API listens on port 4000.

`GEMINI_API_KEY` is required only for `/api/ai/generate`. It must never be exposed to the frontend.

## API compatibility

The existing `/api/*` endpoints are preserved, including catalog/search, newsletter/contact, AI generation, affiliate redirects/click tracking, and the complete admin authentication/stats/CRUD surface.

## Checks

Run `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm test`, and `npm run build`.
