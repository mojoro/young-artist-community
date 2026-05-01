# CLAUDE.md — YACTracker

## What this is

YACTracker — a Young Artist Community directory + review platform for Young Artist Programs (YAPs) in classical music/opera. Users browse/filter programs, submit reviews, mark reviews as helpful, submit new programs, edit existing ones (Wikipedia-style revisions), flag reports, and send site feedback. Admin panel for data management, import candidate review, and report/feedback triage.

## Stack

- Next.js 16 (App Router, Server Components, React Compiler enabled)
- React 19
- TypeScript (strict mode)
- Prisma 7 ORM + `@prisma/adapter-pg` (vanilla `pg` driver)
- Supabase Postgres (provisioned via Vercel Marketplace integration)
- Tailwind CSS v4
- OpenRouter (Claude Haiku 4.5) for LLM extraction
- Vitest (unit) + Playwright (e2e)
- Husky + lint-staged pre-commit hooks
- Deploy to Vercel

## Project structure

```
yactracker/
├── prisma/
│   ├── schema.prisma          # do not modify without asking
│   └── seed.ts                # seed script: reference data, programs, import sources
├── prisma.config.ts           # Prisma 7 config (root, reads .env.local)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # root layout w/ header nav, footer, tuning fork logo SVG
│   │   ├── icon.svg           # favicon — tuning fork mark
│   │   ├── opengraph-image.tsx # dynamic OG image
│   │   ├── page.tsx           # landing — featured programs, search, category chips
│   │   ├── about/page.tsx
│   │   ├── subscribe/         # mailing list signup (Subscriber model)
│   │   │   ├── page.tsx
│   │   │   ├── subscribe-form.tsx
│   │   │   └── actions.ts
│   │   ├── components/        # shared client components
│   │   │   ├── combobox.tsx
│   │   │   ├── program-card.tsx
│   │   │   ├── program-combobox.tsx
│   │   │   ├── mobile-header.tsx
│   │   │   ├── feedback-modal.tsx     # site-wide feedback widget
│   │   │   └── feedback-actions.ts
│   │   ├── programs/
│   │   │   ├── page.tsx       # browsable/filterable program directory
│   │   │   ├── new/           # user-submitted new programs (public)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── program-form.tsx
│   │   │   │   └── actions.ts
│   │   │   └── [slug]/        # public pages keyed by slug (not id)
│   │   │       ├── page.tsx   # detail + reviews + helpful/like + report form
│   │   │       ├── actions.ts # submitReport server action
│   │   │       ├── helpful-button.tsx # like a review (ReviewLike, IP-hash dedup)
│   │   │       ├── report-form.tsx
│   │   │       ├── edit/      # user program edits → ProgramRevision (Wikipedia-style)
│   │   │       │   ├── page.tsx
│   │   │       │   ├── edit-form.tsx
│   │   │       │   └── actions.ts
│   │   │       └── auditions/new/
│   │   │           ├── page.tsx
│   │   │           ├── audition-form.tsx
│   │   │           └── actions.ts
│   │   ├── reviews/new/       # user-submitted reviews (public)
│   │   │   ├── page.tsx
│   │   │   ├── review-form.tsx
│   │   │   └── actions.ts
│   │   ├── admin/
│   │   │   ├── page.tsx       # admin login (ADMIN_TOKEN gate)
│   │   │   ├── actions.ts     # login/logout/isAdminAuthenticated
│   │   │   ├── import/        # candidate review, sources, scrape trigger
│   │   │   ├── data/          # program/review/audition CRUD
│   │   │   ├── reports/       # triage user-submitted reports (status: pending/reviewed/...)
│   │   │   └── feedback/      # triage site-wide feedback
│   │   └── api/               # REST API (Zalando-aligned, RFC 9457 errors)
│   │       ├── programs/      # [program_id] — API still keyed by id, not slug
│   │       │   └── [program_id]/{route.ts, reviews/, auditions/}
│   │       ├── instruments/ · categories/ · locations/
│   │       └── import/run/    # POST trigger scrape (CRON_SECRET gated)
│   └── lib/
│       ├── prisma.ts          # singleton Prisma client w/ NeonAdapter
│       ├── problem.ts         # RFC 9457 problem+json helpers
│       ├── pagination.ts      # cursor-based pagination (opaque base64url tokens)
│       ├── sort.ts            # sort param parsing + Prisma orderBy
│       ├── types.ts           # shared TypeScript types
│       ├── api.ts             # typed fetch helpers (server actions only)
│       ├── slug.ts            # name → kebab-case slug (strips diacritics)
│       ├── ip-hash.ts         # sha256 of request IP (ReviewLike dedup, etc.)
│       ├── __mocks__/prisma.ts # vitest-mock-extended mock
│       ├── *.test.ts          # vitest unit tests colocated in lib/
│       └── import/
│           ├── constants.ts · robots.ts · throttle.ts · fetcher.ts
│           ├── extractor.ts   # OpenRouter LLM extractor w/ Zod validation
│           ├── candidate.ts   # dedupe matching + ProgramCandidate creation
│           ├── upsert.ts      # approve → upsert Program from extracted JSON
│           └── run.ts         # orchestrator: fetch → extract → candidate
├── e2e/                       # Playwright e2e tests
│   ├── auth.setup.ts          # logs in admin, writes e2e/.auth/admin.json
│   ├── public/                # unauthenticated specs (Chromium)
│   └── admin/                 # authenticated specs, reuse storageState
├── docs/
│   ├── blog-context.md
│   └── program-data-sources.md
├── public/                    # static assets
├── openapi.yaml               # OpenAPI 3.0.3 spec (Zally-linted)
├── erd.mmd                    # Mermaid ERD
├── next.config.ts             # reactCompiler: true
├── playwright.config.ts · vitest.config.ts · eslint.config.mjs · postcss.config.mjs
├── vercel.json                # Vercel cron: monthly import run
├── CLAUDE.md · README.md
└── .env.local                 # DATABASE_URL, ADMIN_TOKEN, OPENROUTER_API_KEY, CRON_SECRET
```

## Database schema

Prisma schema at `prisma/schema.prisma`. Models:

**Core entities:**

- `Program` — central entity. Scalar fields: dates, tuition, age range, scholarship, URLs. Has unique `slug` (public pages key on this).
- `Review` — belongs to one Program (FK `program_id`). Fields: rating (int 1-5), year_attended, reviewer_name, title, body.
- `ReviewLike` — user "helpful" vote on a review. Dedup by `(review_id, ip_hash)` where `ip_hash` is sha256 of the request IP (`src/lib/ip-hash.ts`).
- `Audition` — belongs to one Program (FK `program_id`) + one Location (FK `location_id`). Fields: time_slot, fee, instructions, registration URL.

**Reference data:**

- `Instrument` — unique name. Filter dropdowns. Validated on write — never auto-create from user input.
- `Category` — unique name. Filter dropdowns. Validated on write.
- `Location` — city, country, state, address. Matched case-insensitively on city+country.

**Join tables (all @@unique on FK pair):**

- `ProgramInstrument` — Program ↔ Instrument (M:N)
- `ProgramCategory` — Program ↔ Category (M:N)
- `ProgramLocation` — Program ↔ Location (M:N)
- `ProgramProduction` — Program ↔ Production (M:N, current-season operas/shows)
- `AuditionInstrument` — Audition ↔ Instrument (M:N)

**Productions:**

- `Production` — opera/show (title + composer). Tied to programs via `ProgramProduction`.

**User edits + moderation:**

- `ProgramRevision` — Wikipedia-style edit history. User program edits write a revision row (JSON snapshot + optional `edit_summary`), not a direct `program` write.
- `Report` — user-submitted flag on a program or review. Types: `inaccurate_data` | `inappropriate_content` | `other`. Status: `pending` | `reviewed` | `resolved` | `dismissed`. Triage in `/admin/reports`.
- `Feedback` — site-wide feedback (via `FeedbackModal`). Status: `pending` | `read` | `resolved`. Triage in `/admin/feedback`.
- `Subscriber` — mailing list email (unique). Written from `/subscribe`.

**Import pipeline:**

- `ImportSource` — URL to scrape, links to optional Program. Has status (active/paused/broken).
- `ImportRun` — one fetch attempt. Stores gzipped HTML, hash, extraction model/tokens, result.
- `ProgramCandidate` — extracted program data awaiting human approval. Status: pending/approved/rejected/stale.

## API design rules

Follows Zalando RESTful API Guidelines (pragmatically — see memory).

1. **snake_case** all JSON props + query params.
2. **Plural resource names** in URLs.
3. **Sub-resources** for owned entities.
4. **All errors** return `application/problem+json` per RFC 9457.
5. **POST** → 201 + created resource + `Location` header.
6. **PUT** → 200 + updated resource. P2002 → 409 conflict.
7. **GET** collections → `{ "items": [...], "meta": { "next", "prev", "total_items" } }`.
8. **Cursor pagination** — opaque base64url tokens encoding `{offset}`. `cursor` + `limit` params.
9. **Sorting** via `sort` query param. Comma-separated, `-` prefix = desc.
10. **Validation errors** → 400 (not 422, per Zalando).
11. **No auth** on public API. Admin pages gated by `ADMIN_TOKEN` cookie.

## Data fetching pattern

**Server components query Prisma directly.** Do NOT use `apiFetch`/HTTP self-fetch from server components — it causes unnecessary round-trips and 401 errors on Vercel deployment-protected URLs. The `src/lib/api.ts` helpers exist only for server actions that POST to API routes.

## Admin pages

All admin pages gated by `ADMIN_TOKEN` env var (cookie-based, set via `/admin` login form).

- `/admin` — login page
- `/admin/import` — import pipeline: candidate review (approve/reject/edit), source management (add/list/re-extract), scrape trigger
- `/admin/data` — program CRUD (edit all fields), review delete, audition CRUD (create/edit/delete)
- `/admin/reports` — triage user-submitted reports (update status, add admin notes)
- `/admin/feedback` — triage site-wide feedback (update status, add admin notes)

Reference data (instruments, categories, locations) is **validated, not auto-created** on the admin pages. Unknown values are rejected with an error listing valid options.

## Import pipeline

Flow: `ImportSource` → fetch HTML → hash diff → LLM extract (OpenRouter, Claude Haiku 4.5) → `ProgramCandidate` → human review → approve → upsert `Program`.

- Fetch respects robots.txt, 5s per-host throttle
- Hash comparison skips extraction when content unchanged
- Re-extract button runs extraction on stored HTML without re-fetching
- Approve resolves instrument/category/location names to existing IDs (skips unknown)
- Monthly Vercel cron triggers `POST /api/import/run` (gated by `CRON_SECRET`)

## Environment variables

- `POSTGRES_PRISMA_URL` — Supabase pooled (pgbouncer 6543) — runtime connection
- `POSTGRES_URL_NON_POOLING` — Supabase direct (5432) — `prisma db push` / migrations
- `ADMIN_TOKEN` — shared secret for admin login
- `OPENROUTER_API_KEY` — for LLM extraction
- `CRON_SECRET` — Vercel cron auth (auto-sent as Bearer token)

Vercel Marketplace Supabase integration also auto-wires `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc. — currently unused (we only consume the Postgres URL).

## Design system

**Logo:** Resonating tuning fork (U-shaped, parallel prongs, vibration arcs). Inline SVG in `layout.tsx`, uses `fill-brand-*` classes so it follows the palette. Favicon is `src/app/icon.svg`.

**Palette token system** (`globals.css` `@theme inline`). Four color roles, all swappable:

| Token                      | Role          | Usage                                 |
| -------------------------- | ------------- | ------------------------------------- |
| `brand-50/500/600/700/900` | Primary       | Logo bg, buttons, links, CTAs, footer |
| `accent-500`               | Rating        | Star icons, rating numbers            |
| `tag-50/700`               | Categories    | Category badge bg + text              |
| `success-50/600/700`       | Financial aid | Scholarship/aid badges                |

Five named palettes in `globals.css` (one active, rest commented). Active: **Aix-en-Provence** (terracotta + saffron + lavender + olive). Swap = change one block.

**Card pattern:** `rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition hover:shadow-md hover:-translate-y-0.5`

**Page background:** `bg-slate-50` (body), white cards on top for depth.

## Tailwind v4 rules (IMPORTANT)

- **Only** `@import "tailwindcss"` in `src/app/globals.css`. No `@tailwind` directives (v3).
- Unlayered CSS **beats** utilities — wrap overrides in `@layer base { ... }`.
- No `prefers-color-scheme: dark` blocks. POC palette is light.
- Design tokens in `@theme inline { ... }`.
- Never write raw `font-family` in globals.css — Geist loaded via `next/font`.
- Use `brand-*`, `accent-*`, `tag-*`, `success-*` tokens for colors — never hardcode `indigo-*`, `amber-*`, `emerald-*` in public pages.

## Scripts

| Script | What it runs |
| --- | --- |
| `npm run dev` | `next dev` |
| `npm run build` | `prisma generate && prisma db push && next build` — schema is pushed to `DATABASE_URL` on every build (including Vercel) |
| `npm run lint` | `eslint` |
| `npm run format` / `format:check` | Prettier (incl. `prettier-plugin-tailwindcss`) |
| `npm test` / `test:watch` / `test:coverage` | vitest (unit) |
| `npm run db:push` / `db:seed` / `db:studio` | Prisma dev helpers |
| `npx playwright test` | Playwright e2e |

Husky + lint-staged run `eslint --fix` and Prettier on staged files pre-commit (`prepare: husky`).

## Testing

**Unit (vitest):** `*.test.ts` files colocated in `src/lib/`. Prisma is mocked via `src/lib/__mocks__/prisma.ts` (`vitest-mock-extended`).

**E2E (Playwright):** `e2e/` tree, two projects:

- `public/` — unauthenticated Chromium.
- `admin/` — depends on `setup` project (`e2e/auth.setup.ts`) which logs in with `ADMIN_TOKEN` and writes `e2e/.auth/admin.json`. Admin specs load that as `storageState`.

Local runs use a `webServer` (`npm run build && npm start` on :3000, `reuseExistingServer`). CI skips that and expects `BASE_URL` set. When `VERCEL_AUTOMATION_BYPASS_SECRET` is present, the `x-vercel-protection-bypass` header is added to all requests — use this to run e2e against a preview deployment.

## Important constraints

- No public auth/authz. Admin uses `ADMIN_TOKEN`.
- No PATCH — PUT for all updates.
- Every collection response wrapped in `{ "items": [...] }`.
- UUIDs for all primary keys.
- Timestamps UTC, RFC 3339.
- **Public pages use `slug` in the URL** (`/programs/[slug]`); **API routes still use `program_id`** (`/api/programs/[program_id]`). Don't "fix" this to match.
- **User program edits go through `ProgramRevision`**, not a direct `program` write. The edit UI is public (`/programs/[slug]/edit`); revisions are the audit trail.
- **Review likes dedup by hashed IP.** Don't store raw IPs — always go through `src/lib/ip-hash.ts`.
- **Reference data is validated, not auto-created** on every write path (admin and public).
- `prisma/` excluded from tsconfig (seed.ts uses standalone PrismaClient).
- React Compiler is enabled (`next.config.ts` `reactCompiler: true` + `babel-plugin-react-compiler`). Don't hand-memoize — let the compiler handle it.
- OpenAPI spec (`openapi.yaml`) = source of truth for API request/response shapes.
