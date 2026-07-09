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
```

There is no test suite. `vercel-build` (`prisma generate && prisma migrate deploy && next build`) is what runs on deploy.

## Architecture

### Multi-tenancy — the central invariant
`Tenant.id` **is** the Clerk `orgId`. There is no separate mapping. Every tenant-owned row (Category, Product, Order, TenantMember) carries `tenantId`, and every API route derives it from Clerk:

```ts
const { orgId } = await auth();
if (!orgId) return 401;
// then always filter/scope by { tenantId: orgId }
```

When adding queries or mutations, you **must** scope by `tenantId: orgId` or you leak/cross-write between tenants. Note: some existing DELETE/PUT handlers (`api/orders` DELETE, `api/catalog` PUT/DELETE) look up rows by `id` alone without the tenant scope — follow the *scoped* pattern for new code, don't copy the unscoped ones.

### Auth & roles (Clerk is source of truth)
- Middleware lives in **`proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`), not the usual filename. It runs `clerkMiddleware`, redirects signed-in users away from `/login`·`/inscription`, and gates `/admin*` on `orgRole === "org:admin"`.
- Two role vocabularies coexist: Clerk (`org:admin` / `org:member`) and a DB enum `TenantRole` (`ADMIN` / `USER`) on `TenantMember`. Authorization decisions use **Clerk** roles (see `api/members` admin checks). The `TenantMember` table is a partial mirror, best-effort synced — treat Clerk as authoritative.

### Prisma client is generated OUT of node_modules
`generator client { output = "../generated/prisma" }`. Import from `@/generated/prisma/client`, not `@prisma/client`. The singleton in `lib/prisma.ts` uses the `PrismaPg` driver adapter over a `DATABASE_URL` connection string. After changing the schema, run `bunx prisma generate` or types won't update.

### Frontend data flow
- Route group `app/(authenticated)/` (admin & user pages) is wrapped by `AppProvider` (`app/context/AppContext.tsx`) via its layout. `AppContext` is the client-side store: it fetches `/api/catalog` on load and exposes CRUD actions that POST/PUT/DELETE then `refreshData()`.
- The catalog API (`app/api/catalog/route.ts`) is a single route multiplexed by a `type` field (`"category" | "subCategory" | "product"`) in the JSON body / query string, rather than separate endpoints.
- Public (unauthenticated) routes: landing `app/page.tsx`, `app/a-propos`, `app/inscription`, `app/login`, `app/accept-invitation`, and `app/api/public/create-organization`.

### Notable flows
- **Onboarding** (`api/public/create-organization`): provisions two Clerk users (admin + member) with generated passwords, creates the Clerk org, creates the matching `Tenant` + `TenantMember` rows, marks both passwords compromised (forces reset on first login), and emails credentials via **Resend** (`emails/WelcomeEmail.tsx`, react-email). Falls back to console-logging credentials if `RESEND_API_KEY` is unset.
- **Menu import** (`api/generate-menu`): upload PDF/image/text → OCR via ocr.space (PDFs split into 3-page chunks with `pdf-lib`) → Perplexity `sonar` model with a strict JSON prompt → parse → bulk-insert Categories/SubCategories/Products for the tenant.
- **Members** (`api/members`): admin invites via Clerk org invitations (hard cap of 4 members), redirecting to `/accept-invitation`.

## Conventions

- Path alias `@/*` → repo root (e.g. `@/lib/prisma`, `@/generated/prisma/client`, `@/emails/...`).
- UI text and domain language are **French** ("commandes", "production", "catalogue"). Match it in user-facing strings.
- Env vars: `DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_*`, `RESEND_API_KEY`, `OCR_API_KEY`, `PERPLEXITY_API_KEY`. Prisma loads env via `dotenv/config` in `prisma.config.ts`.
- Icons: `lucide-react`. Styling: Tailwind CSS v4 (PostCSS plugin, no `tailwind.config` — configured in `app/globals.css`).
- **Design system**: brand tokens live in `app/globals.css` `@theme` (palette "artisan" derived from the logo: `cream`, `parchment`, `ink`, `primary` brown, `gold`, `olive`, `danger`, `line` for borders). Use these semantic utilities (`bg-cream`, `text-ink`, `border-line`…), never raw Tailwind grays/blues. Fonts: Playfair Display (`font-display`, headings) + Karla (`font-sans`, body), loaded via `next/font` with variables on `<html>` in `app/layout.tsx` (they must stay on `<html>`, not `<body>`, or the `@theme` font tokens fail to resolve).
- **Shared UI components**: `app/components/ui.tsx` (Button, IconButton, Input, Select, Label, Card, CardHeader, Badge, EmptyState, Segmented, Th/Td, LoadingBlock). Reuse them instead of hand-rolling Tailwind classes; primary usage target is tablet, so keep touch targets ≥ 44px (`h-11` default).

Commit message format (per user's global rules): `<BRANCH_NAME> <GITMOJI> <short description>`.
