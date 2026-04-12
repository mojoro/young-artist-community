import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { badRequest, internalError } from '@/lib/problem'
import { runFetchForSource } from '@/lib/import/run'

/**
 * POST /api/import/run
 *
 * Triggers the fetch+extract pipeline for one or all active ImportSources.
 *
 * Query params:
 *   source_id — run a single source (optional; omit to run all active)
 *   extract   — "true" to also run LLM extraction (default: true)
 *
 * Gated by CRON_SECRET: the request must include an Authorization header
 * with `Bearer <CRON_SECRET>`. Vercel Cron automatically sends this.
 */
export async function POST(request: Request) {
  // Auth gate
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { type: '/problems/unauthorized', title: 'Unauthorized', status: 401 },
        { status: 401, headers: { 'Content-Type': 'application/problem+json' } },
      )
    }
  }

  const url = new URL(request.url)
  const sourceId = url.searchParams.get('source_id')
  const extract = url.searchParams.get('extract') !== 'false'

  try {
    let sources
    if (sourceId) {
      const source = await prisma.importSource.findUnique({
        where: { id: sourceId },
      })
      if (!source) return badRequest(`ImportSource ${sourceId} not found`)
      sources = [source]
    } else {
      sources = await prisma.importSource.findMany({
        where: { status: 'active' },
        orderBy: { last_fetched_at: { sort: 'asc', nulls: 'first' } },
      })
    }

    if (sources.length === 0) {
      return NextResponse.json({ items: [], summary: 'No active sources' })
    }

    // Run sequentially to respect per-host throttling
    const results = []
    for (const source of sources) {
      const result = await runFetchForSource(source, { extract })
      results.push({
        source_id: result.source_id,
        import_run_id: result.import_run_id,
        result: result.result,
        candidate_id: result.candidate?.candidate_id ?? null,
        matched_program_id: result.candidate?.matched_program_id ?? null,
      })
    }

    const summary = {
      total: results.length,
      success: results.filter((r) => r.result === 'success').length,
      unchanged: results.filter((r) => r.result === 'unchanged').length,
      fetch_error: results.filter((r) => r.result === 'fetch_error').length,
      extraction_error: results.filter((r) => r.result === 'extraction_error').length,
    }

    return NextResponse.json({ items: results, summary })
  } catch (e) {
    console.error('Import run failed:', e)
    return internalError(e instanceof Error ? e.message : String(e))
  }
}
