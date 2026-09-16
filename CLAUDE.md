# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Cahier du Chef** (brand "Cet Extra") — a French SaaS for caterers/restaurants to manage a product catalog (menu) and client orders ("commandes"). Multi-tenant: each customer organization sees only its own catalog and orders.

Next.js 16 (App Router) + React 19 + Prisma 7 (PostgreSQL) + Clerk (auth & organizations). Package manager is **Bun** (`bun.lockb`).

## Commands

```bash
bun install            # install deps
bun run dev            # dev server on http://localhost:3000
bun run build          # production build
bun run lint           # eslint (flat config, next/core-web-vitals + typescript)

# Prisma (schema at prisma/schema.prisma)
bunx prisma migrate dev --name <name>   # create + apply migration locally
bunx prisma generate                    # regenerate client -> generated/prisma
bun prisma/seed.ts                       # seed (also runs via prisma db seed)

# Tests (Vitest + React Testing Library + MSW)
bun run test                            # unit tests: Prisma mocked, no DB needed
bun run test:integration:migrate        # apply migrations to the Docker test DB (once, after `docker compose up -d`)
bun run test:integration                # integration tests: real Postgres (docker-compose.yml), tenant-scoping invariants
```

`vercel-build` (`prisma generate && prisma migrate deploy && next build`) is what runs on deploy.

## Architecture

### Multi-tenancy — the central invariant
`Tenant.id` **is** the Clerk `orgId`. There is no separate mapping. Every tenant-owned row (Category, Product, Order) carries `tenantId`, and every API route derives it from Clerk:

```ts
const { orgId } = await auth();
if (!orgId) return 401;
// then always filter/scope by { tenantId: orgId }
```

When adding queries or mutations, you **must** scope by `tenantId: orgId` or you leak/cross-write between tenants. As of 2026-07-18 every API route follows this pattern — keep it that way.

### Auth: one Clerk account per tenant, admin panel behind a PIN
See `docs/adr/0003-compte-unique-pin-admin.md` for the full rationale (supersedes the old two-account/`orgRole` model and `docs/adr/0001-commandes-lecture-seule-membres.md`'s planned narrow PIN elevation).
- Each tenant has a **single** Clerk user/organization membership (created `org:admin` at signup) — no more separate admin/member accounts, no Clerk org invitations, no `TenantMember` table.
- `/user` and `/commandes` are open to anyone signed in — no role check. `/admin` is gated by a **6-digit PIN**, not by Clerk role: `app/(authenticated)/admin/layout.tsx` renders `<PinGate />` instead of its children when there's no valid admin session, rather than redirecting.
- The PIN is a real server-side barrier: `Tenant.pinCodeHash` (`crypto.scrypt`, see `lib/pin.ts`), rate-limited with a progressive lockout (`lib/pin.ts#computeLockoutMs`, doubles each episode up to 15 min) that emails the tenant on lockout (`emails/PinLockoutEmail.tsx`). A correct PIN sets a short-lived signed httpOnly cookie (`lib/adminSession.ts`, `ADMIN_SESSION_SECRET`) via `POST /api/admin-session`; there is **no persistence across visits** — leaving `/admin` (or the cookie's 15 min TTL) always requires re-entering the PIN. `lib/adminSession.ts#requireAdminSession()` is the drop-in replacement for the old `orgRole !== "org:admin"` checks in API routes (`orders`, `orders/[id]`, `catalog` — the latter had no server-side role check at all before this).
- Forgotten PIN: `POST /api/admin-session/forgot` emails a short-lived signed reset link (`emails/PinResetEmail.tsx`) to `/reinitialiser-pin`, which calls `POST /api/admin-session/reset`.
- Order editing lives entirely inside `/admin` (`app/components/OrderForm.tsx`, `variant="embedded"`) rather than navigating out to `/user?orderId=` — that navigation would have crossed the PIN boundary onto an unprotected route.

### Prisma client is generated OUT of node_modules
`generator client { output = "../generated/prisma" }`. Import from `@/generated/prisma/client`, not `@prisma/client`. The singleton in `lib/prisma.ts` uses the `PrismaPg` driver adapter over a `DATABASE_URL` connection string. After changing the schema, run `bunx prisma generate` or types won't update.

### Frontend data flow
- Route group `app/(authenticated)/` (admin & user pages) is wrapped by `AppProvider` (`app/context/AppContext.tsx`) via its layout. `AppContext` is the client-side store: it fetches `/api/catalog` on load and exposes CRUD actions that POST/PUT/DELETE then `refreshData()`.
- The catalog API (`app/api/catalog/route.ts`) is a single route multiplexed by a `type` field (`"category" | "subCategory" | "product"`) in the JSON body / query string, rather than separate endpoints.
- Public (unauthenticated) routes: landing `app/page.tsx`, `app/a-propos`, `app/inscription`, `app/login`, and `app/api/public/create-organization`.

### Notable flows
- **Onboarding** (`api/public/create-organization`): creates a single Clerk user (`org:admin`) and org, the matching `Tenant` row with a hashed PIN (`pinCode` collected in the signup form), and emails a welcome message via **Resend** (`emails/WelcomeEmail.tsx`, react-email). Falls back to console-logging if `RESEND_API_KEY` is unset.
- **Menu import** (`api/generate-menu`): upload PDF/image/text → OCR via ocr.space (PDFs split into 3-page chunks with `pdf-lib`) → Gemini (`@google/genai`, model configurable via `GEMINI_MODEL`, defaults to `gemini-3.6-flash`) with a strict JSON prompt → parse → bulk-insert Categories/SubCategories/Products for the tenant.

## Conventions

- Path alias `@/*` → repo root (e.g. `@/lib/prisma`, `@/generated/prisma/client`, `@/emails/...`).
- UI text and domain language are **French** ("commandes", "production", "catalogue"). Match it in user-facing strings.
- Env vars: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_*`, `RESEND_API_KEY`, `OCR_API_KEY`, `GEMINI_API_KEY` (optionally `GEMINI_MODEL`), `ADMIN_SESSION_SECRET` (HMAC secret signing the admin-session cookie and PIN-reset tokens, see `lib/adminSession.ts`). Prisma loads env via `dotenv/config` in `prisma.config.ts`.
- Icons: `lucide-react`. Styling: Tailwind CSS v4 (PostCSS plugin, no `tailwind.config` — configured in `app/globals.css`).
- **Design system**: brand tokens live in `app/globals.css` `@theme` (palette "artisan" derived from the logo: `cream`, `parchment`, `ink`, `primary` brown, `gold`, `olive`, `danger`, `line` for borders). Use these semantic utilities (`bg-cream`, `text-ink`, `border-line`…), never raw Tailwind grays/blues. Fonts: Playfair Display (`font-display`, headings) + Karla (`font-sans`, body), loaded via `next/font` with variables on `<html>` in `app/layout.tsx` (they must stay on `<html>`, not `<body>`, or the `@theme` font tokens fail to resolve).
- **Shared UI components**: `app/components/ui.tsx` (Button, IconButton, Input, Select, Label, Card, CardHeader, Badge, EmptyState, Segmented, Th/Td, LoadingBlock). Reuse them instead of hand-rolling Tailwind classes; primary usage target is tablet, so keep touch targets ≥ 44px (`h-11` default).

Commit message format (per user's global rules): `<BRANCH_NAME> <GITMOJI> <short description>`.
