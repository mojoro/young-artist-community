import Link from 'next/link'
import {
  buildQuery,
  listCategories,
  listInstruments,
  listLocations,
  listPrograms,
} from '@/lib/api'
import type { Program } from '@/lib/types'

type SearchParams = { [key: string]: string | string[] | undefined }

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '-created_at', label: 'Newest' },
  { value: 'name', label: 'Name (A→Z)' },
  { value: '-name', label: 'Name (Z→A)' },
  { value: 'application_deadline', label: 'Deadline (soonest)' },
  { value: '-application_deadline', label: 'Deadline (latest)' },
  { value: 'tuition', label: 'Tuition (low→high)' },
  { value: '-tuition', label: 'Tuition (high→low)' },
]

function getString(params: SearchParams, key: string): string | undefined {
  const v = params[key]
  if (v === undefined) return undefined
  if (Array.isArray(v)) return v[0]
  return v
}

function formatTuition(n: number | null): string {
  if (n === null) return 'Not listed'
  if (n === 0) return 'Free'
  return `$${n.toLocaleString('en-US')}`
}

function formatDate(iso: string | null): string {
  if (!iso) return 'TBD'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'TBD'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRating(avg: number | null, count: number): string {
  if (!count || avg === null) return 'No reviews yet'
  return `★ ${avg.toFixed(1)} (${count} review${count === 1 ? '' : 's'})`
}

function pageLink(params: SearchParams, newPageNumber: number): string {
  const qs = new URLSearchParams()
  const keys = [
    'q',
    'instrument_id',
    'category_id',
    'country',
    'offers_scholarship',
    'tuition_lower_than',
    'sort',
    'page[size]',
  ]
  for (const k of keys) {
    const v = getString(params, k)
    if (v !== undefined && v !== '') qs.set(k, v)
  }
  qs.set('page[number]', String(newPageNumber))
  return `/programs?${qs.toString()}`
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const query = buildQuery({
    q: getString(params, 'q'),
    instrument_id: getString(params, 'instrument_id'),
    category_id: getString(params, 'category_id'),
    country: getString(params, 'country'),
    offers_scholarship: getString(params, 'offers_scholarship'),
    tuition_lower_than: getString(params, 'tuition_lower_than'),
    sort: getString(params, 'sort') ?? '-created_at',
    'page[number]': getString(params, 'page[number]') ?? '0',
    'page[size]': getString(params, 'page[size]') ?? '12',
  })

  const [programsRes, allProgramsRes, instrumentsRes, categoriesRes, locationsRes] =
    await Promise.all([
      listPrograms(query),
      listPrograms(buildQuery({ 'page[size]': '100' })),
      listInstruments(),
      listCategories(),
      listLocations(),
    ])

  const { items: programs, meta } = programsRes
  const allPrograms = allProgramsRes.items

  const usedInstrumentIds = new Set<string>()
  const usedCategoryIds = new Set<string>()
  const usedCountries = new Set<string>()
  for (const p of allPrograms) {
    for (const i of p.instruments) usedInstrumentIds.add(i.id)
    for (const c of p.categories) usedCategoryIds.add(c.id)
    for (const l of p.locations) usedCountries.add(l.country)
  }

  const instruments = instrumentsRes.items.filter((i) => usedInstrumentIds.has(i.id))
  const categories = categoriesRes.items.filter((c) => usedCategoryIds.has(c.id))
  const countries = locationsRes.items
    .map((l) => l.country)
    .filter((c, idx, arr) => usedCountries.has(c) && arr.indexOf(c) === idx)
    .sort()

  const currentQ = getString(params, 'q') ?? ''
  const currentInstrument = getString(params, 'instrument_id') ?? ''
  const currentCategory = getString(params, 'category_id') ?? ''
  const currentCountry = getString(params, 'country') ?? ''
  const currentScholarship = getString(params, 'offers_scholarship') === 'true'
  const currentTuition = getString(params, 'tuition_lower_than') ?? ''
  const currentSort = getString(params, 'sort') ?? '-created_at'

  const pageNumber = meta.page_number
  const totalPages = Math.max(1, meta.total_pages)
  const hasPrev = pageNumber > 0
  const hasNext = pageNumber + 1 < totalPages

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Programs</h1>
        <p className="mt-1 text-sm text-gray-600">
          Browse and filter young artist programs.
        </p>
      </header>

      <form
        action="/programs"
        method="GET"
        className="mb-6 rounded-lg border border-gray-200 bg-white p-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <label htmlFor="q" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="text"
              defaultValue={currentQ}
              placeholder="Search by name or description..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="instrument_id" className="block text-sm font-medium text-gray-700">
              Instrument
            </label>
            <select
              id="instrument_id"
              name="instrument_id"
              defaultValue={currentInstrument}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">All instruments</option>
              {instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={currentCategory}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="country"
              name="country"
              defaultValue={currentCountry}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tuition_lower_than" className="block text-sm font-medium text-gray-700">
              Max tuition (USD)
            </label>
            <input
              id="tuition_lower_than"
              name="tuition_lower_than"
              type="number"
              min="0"
              step="1"
              defaultValue={currentTuition}
              placeholder="e.g. 5000"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
              Sort by
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={currentSort}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="offers_scholarship"
                value="true"
                defaultChecked={currentScholarship}
                className="h-4 w-4 rounded border-gray-300"
              />
              Offers scholarship
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Apply filters
          </button>
          <Link
            href="/programs"
            className="text-sm text-gray-600 underline hover:text-gray-900"
          >
            Clear
          </Link>
          <span className="ml-auto text-sm text-gray-500">
            {meta.total_items} result{meta.total_items === 1 ? '' : 's'}
          </span>
        </div>
      </form>

      {programs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-700">No programs match your filters.</p>
          <Link
            href="/programs"
            className="mt-3 inline-block text-sm text-gray-900 underline hover:text-gray-600"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>

          <nav className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
            {hasPrev ? (
              <Link
                href={pageLink(params, pageNumber - 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                ← Previous
              </Link>
            ) : (
              <span className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
                ← Previous
              </span>
            )}

            <span className="text-sm text-gray-600">
              Page {pageNumber + 1} of {totalPages}
            </span>

            {hasNext ? (
              <Link
                href={pageLink(params, pageNumber + 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Next →
              </Link>
            ) : (
              <span className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
                Next →
              </span>
            )}
          </nav>
        </>
      )}
    </main>
  )
}

function ProgramCard({ program }: { program: Program }) {
  const locationText =
    program.locations.length > 0
      ? program.locations.map((l) => `${l.city}, ${l.country}`).join(' • ')
      : 'Location TBD'

  const shownInstruments = program.instruments.slice(0, 3)
  const extraInstruments = program.instruments.length - shownInstruments.length

  const shownCategories = program.categories.slice(0, 3)
  const extraCategories = program.categories.length - shownCategories.length

  return (
    <article className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-400 hover:shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        <Link href={`/programs/${program.id}`} className="hover:underline">
          {program.name}
        </Link>
      </h2>
      <p className="mt-1 text-sm text-gray-600">{locationText}</p>

      {(shownCategories.length > 0 || shownInstruments.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {shownCategories.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white"
            >
              {c.name}
            </span>
          ))}
          {extraCategories > 0 && (
            <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-medium text-white">
              +{extraCategories}
            </span>
          )}
          {shownInstruments.map((i) => (
            <span
              key={i.id}
              className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-700"
            >
              {i.name}
            </span>
          ))}
          {extraInstruments > 0 && (
            <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-700">
              +{extraInstruments}
            </span>
          )}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Tuition</dt>
          <dd className="text-gray-900">{formatTuition(program.tuition)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-500">Deadline</dt>
          <dd className="text-gray-900">{formatDate(program.application_deadline)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-700">
          {formatRating(program.average_rating, program.review_count)}
        </span>
        {program.offers_scholarship && (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Scholarship
          </span>
        )}
      </div>
    </article>
  )
}
