# Pair Shop Next.js Demo

Inclusive pair-matching storefront built with Next.js 14, Prisma, and Tailwind CSS. Customers answer a short form, the matching engine recommends bundles, and admins can curate inventory with CSV import support.

## Prerequisites

- Node.js 18+
- npm 9+
- SQLite (bundled) or any PostgreSQL database

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   Copy the example file and adjust as needed:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_PROVIDER` — `sqlite` (default) or `postgresql`
   - `DATABASE_URL` / `SHADOW_DATABASE_URL` — connection strings for Prisma
   - `AUTH_DISABLED` / `NEXT_PUBLIC_AUTH_DISABLED` — set to `true` to run in guest mode
   - `NEXTAUTH_SECRET` — random string for NextAuth sessions
   - `EMAIL_*` — SMTP settings (optional). If omitted, magic links are logged to the console.

3. **Generate the Prisma client**
   ```bash
   npx prisma generate
   ```

4. **Create & migrate the database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the catalog**
   ```bash
   npm run db:seed
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to use the pair diagnosis form.

## Running tests

- Unit tests (Vitest)
  ```bash
  npm run test
  ```
- Playwright smoke test (requires the dev server running on port 3000)
  ```bash
  npm run dev
  # in another terminal
  npm run test:e2e
  ```

## Admin dashboard

Navigate to `/admin/products` to manage catalog entries. Features include:
- Create single products via the inline form
- Update price/stock/visibility
- Bulk import CSV with headers: `name,brand,genderLabel,collection,tags,sizes,price,stock,images,active`

## Authentication

Email magic-link authentication is powered by NextAuth. Enable it by keeping `AUTH_DISABLED` set to `false`, configuring `NEXTAUTH_SECRET`, and providing SMTP credentials (`EMAIL_*`). When disabled, the site runs in guest mode—saving bundles requires authentication.

## Privacy notice

A demo-only privacy statement is available at `/PRIVACY`. Only essential data (email address, saved bundle references) is stored when authentication is enabled.
