# CLAUDE.md — YACTracker

## What this is

YACTracker is a directory and review platform for Young Artist Programs (YAPs) in classical music and opera. Users browse/filter programs and submit reviews. No authentication in v1.

## Stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Prisma ORM
- Neon Postgres (connection string in `DATABASE_URL` env var)
- Tailwind CSS
- Deploy to Vercel

## Project structure

```
yactracker/
├── prisma/
│   ├── schema.prisma        # provided — do not modify without asking
│   └── seed.ts              # seed script for reference data + sample programs
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # landing — featured programs, search entry
│   │   ├── programs/
│   │   │   ├── page.tsx                      # browsable/filterable program directory
│   │   │   └── [program_id]/
│   │   │       └── page.tsx                  # program detail + reviews list + review form
│   │   └── api/
│   │       ├── programs/
│   │       │   ├── route.ts                  # GET (list/filter), POST (create)
│   │       │   └── [program_id]/
│   │       │       ├── route.ts              # GET (single), PUT (update)
│   │       │       ├── reviews/
│   │       │       │   ├── route.ts          # GET (list), POST (create)
│   │       │       │   └── [review_id]/
│   │       │       │       └── route.ts      # GET (single), PUT (update)
│   │       │       └── auditions/
│   │       │           ├── route.ts          # GET (list), POST (create)
│   │       │           └── [audition_id]/
│   │       │               └── route.ts      # GET (single), PUT (update)
│   │       ├── instruments/
│   │       │   ├── route.ts                  # GET (list), POST (create)
│   │       │   └── [instrument_id]/
│   │       │       └── route.ts              # PUT (update)
│   │       ├── categories/
│   │       │   ├── route.ts                  # GET (list), POST (create)
│   │       │   └── [category_id]/
│   │       │       └── route.ts              # PUT (update)
│   │       └── locations/
│   │           ├── route.ts                  # GET (list), POST (create)
│   │           └── [location_id]/
│   │               └── route.ts              # PUT (update)
│   └── lib/
│       ├── prisma.ts                         # singleton Prisma client
│       └── problem.ts                        # RFC 9457 problem JSON helper
├── yactracker-api.yaml                       # OpenAPI 3.1 spec — source of truth for all endpoints
├── CLAUDE.md
└── .env.local                                # DATABASE_URL=<neon connection string>
```

## Database schema

The Prisma schema is in `prisma/schema.prisma`. It defines these models:

**Core entities:**
- `Program` — the central entity. Has scalar fields for dates, tuition, age range, scholarship, URLs.
- `Review` — belongs to one Program (FK `program_id`). Has rating (int 1-5), year_attended, reviewer_name, title, body.
- `Audition` — belongs to one Program (FK `program_id`) and one Location (FK `location_id`). Has time_slot, fee, instructions, registration URL.

**Reference data:**
- `Instrument` — unique name. Used in filter dropdowns.
- `Category` — unique name. Used in filter dropdowns.
- `Location` — city, country, state, address.

**Join tables (all have @@unique on the FK pair):**
- `ProgramInstrument` — Program ↔ Instrument (M:N)
- `ProgramCategory` — Program ↔ Category (M:N)
- `ProgramLocation` — Program ↔ Location (M:N)
- `AuditionInstrument` — Audition ↔ Instrument (M:N)

## API design rules

The API follows Zalando RESTful API Guidelines. Key rules to follow in every route handler:

1. **snake_case** for all JSON property names and query parameters. Never camelCase.
2. **Plural resource names** in URLs: `/programs`, `/reviews`, `/instruments`.
3. **Sub-resources** for owned entities: `/programs/{program_id}/reviews`, `/programs/{program_id}/auditions`.
4. **All errors** return `application/problem+json` per RFC 9457:
   ```json
   {
     "type": "/problems/not-found",
     "title": "Resource not found",
     "status": 404,
     "detail": "Program with id 'xxx' not found."
   }
   ```
5. **POST** returns 201 with the created resource and a `Location` header.
6. **PUT** returns 200 with the updated resource.
7. **GET** on collections returns `{ "items": [...], "meta": { "page_number", "page_size", "total_pages", "total_items" } }`.
8. **Pagination** via `page[number]` (default 0) and `page[size]` (default 20, max 100).
9. **Sorting** via `sort` query param. Comma-separated fields, prefix `-` for descending. Example: `sort=-created_at,name`.
10. **No authentication** in v1. All endpoints are public.

## API endpoints

The full OpenAPI 3.1 spec is in `yactracker-api.yaml`. Implement every endpoint defined there. Key filtering support on `GET /programs`:

- `instrument_id` — filter by instrument UUID (comma-separated for OR)
- `category_id` — filter by category UUID (comma-separated for OR)
- `location_id` — filter by location UUID
- `country` — filter by country name
- `deadline_after` / `deadline_before` — date range on application_deadline
- `tuition_lower_than` — upper bound on tuition
- `offers_scholarship` — boolean filter
- `q` — free-text search on name and description

## Seed data

Create `prisma/seed.ts` that populates:

**Instruments** (at minimum): Voice, Violin, Viola, Cello, Double Bass, Flute, Oboe, Clarinet, Bassoon, French Horn, Trumpet, Trombone, Tuba, Piano, Harp, Percussion, Composition, Conducting

**Categories** (at minimum): Opera, Orchestral, Chamber Music, Art Song / Lieder, Musical Theatre, Baroque, Contemporary, Choral

**Locations** — 8-10 real cities where YAPs exist: Salzburg (Austria), Aspen (Colorado, US), Tanglewood (Massachusetts, US), Santa Fe (New Mexico, US), Glyndebourne (England, UK), Aix-en-Provence (France), Spoleto (Italy), Banff (Alberta, Canada), Ravinia (Illinois, US), Brevard (North Carolina, US)

**Programs** — 10-15 real or realistic YAPs with plausible data. Link them to instruments, categories, and locations via the join tables.

**Reviews** — 2-4 sample reviews per program with varied ratings and years.

**Auditions** — 2-3 auditions per program in different locations.

Configure the seed script in `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

## Frontend pages

Three pages, all server-rendered where possible:

### 1. Landing page (`/`)
- Hero section with tagline: "Find and review young artist programs in classical music and opera"
- Search bar that navigates to `/programs?q=<query>`
- Featured programs section (e.g. nearest deadlines or highest rated)
- Quick filter chips for common categories

### 2. Program directory (`/programs`)
- Filter sidebar or top bar with dropdowns for: instrument, category, country, scholarship, tuition range
- Program cards in a grid showing: name, location(s), category badges, tuition, deadline, average rating, review count
- Pagination controls
- Sort dropdown (deadline, rating, tuition, name)

### 3. Program detail (`/programs/[program_id]`)
- Full program info: description, dates, tuition, age range, scholarship, links
- Instrument and category tags
- Locations list
- Auditions section with dates, locations, fees, registration links
- Reviews section with average rating summary and individual review cards
- Review submission form (reviewer_name, rating 1-5 stars, year_attended, title, body)

## UI guidelines

- Clean, professional aesthetic. Not flashy. Think Glassdoor or Yelp, not Dribbble.
- Tailwind CSS only — no component library.
- Responsive: works on mobile and desktop.
- Use semantic HTML.
- Accessible: proper labels, contrast, focus states.

## Build steps (in order)

1. `npx create-next-app@latest yactracker --typescript --tailwind --app --src-dir`
2. Copy `schema.prisma` to `prisma/schema.prisma`
3. `npm install prisma @prisma/client`
4. `npx prisma generate`
5. `npx prisma db push` (creates tables in Neon)
6. Create `src/lib/prisma.ts` (singleton client)
7. Create `src/lib/problem.ts` (error response helper)
8. Implement all API route handlers per the OpenAPI spec
9. Create seed script, run `npx prisma db seed`
10. Build the three frontend pages
11. Test: verify filtering, pagination, review submission, error responses
12. `npm run build` — ensure no build errors
13. Deploy to Vercel

## Important constraints

- No authentication or authorization in v1.
- No DELETE endpoints in v1.
- No PATCH — use PUT for all updates.
- Every collection response must be wrapped in `{ "items": [...] }` — never return a bare array as top-level JSON.
- UUIDs for all primary keys.
- All timestamps in UTC, format `date-time` per RFC 3339.
- The OpenAPI spec (`yactracker-api.yaml`) is the source of truth for request/response shapes. Match it exactly.