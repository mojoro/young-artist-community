import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated, adminLogout } from '../actions'
import { deleteProgram, deleteReview } from './actions'
import { DeleteButton } from './delete-button'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function AdminDataPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  if (!(await isAdminAuthenticated())) redirect('/admin')

  const params = await searchParams
  const selectedProgramId = typeof params.program === 'string' ? params.program : null

  const programs = await prisma.program.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      _count: { select: { reviews: true, auditions: true } },
    },
  })

  let reviews: Array<{
    id: string
    rating: number
    reviewer_name: string | null
    title: string | null
    body: string
    year_attended: number | null
    created_at: Date
  }> = []

  if (selectedProgramId) {
    reviews = await prisma.review.findMany({
      where: { program_id: selectedProgramId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        rating: true,
        reviewer_name: true,
        title: true,
        body: true,
        year_attended: true,
        created_at: true,
      },
    })
  }

  const selectedProgram = selectedProgramId
    ? programs.find((p) => p.id === selectedProgramId)
    : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Manage data
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/import"
              prefetch={false}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Import
            </Link>
            <Link
              href="/"
              prefetch={false}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Back to site
            </Link>
            <form action={adminLogout}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-900 underline"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Programs table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900">
          Programs ({programs.length})
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Reviews</th>
                <th className="pb-2 pr-4">Auditions</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-gray-100 ${
                    p.id === selectedProgramId ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    <a
                      href={`/admin/data?program=${p.id}`}
                      className="hover:underline"
                    >
                      {p.name}
                    </a>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{p._count.reviews}</td>
                  <td className="py-2 pr-4 text-gray-600">{p._count.auditions}</td>
                  <td className="py-2">
                    <DeleteButton
                      action={deleteProgram}
                      name="program_id"
                      value={p.id}
                      confirmMessage={`Delete "${p.name}" and all its reviews/auditions?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reviews for selected program */}
      {selectedProgram && (
        <section className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Reviews for {selectedProgram.name} ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No reviews.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-500">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </span>
                      {r.title && (
                        <span className="font-medium text-gray-900">{r.title}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2">{r.body}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {r.reviewer_name ?? 'Anonymous'}
                      {r.year_attended ? ` · ${r.year_attended}` : ''}
                      {' · '}
                      {r.created_at.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="ml-4">
                    <DeleteButton
                      action={deleteReview}
                      name="review_id"
                      value={r.id}
                      confirmMessage="Delete this review?"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
