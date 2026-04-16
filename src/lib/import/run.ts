import type { ImportSource } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { fetchSource, type FetchResult } from './fetcher'
import {
  extractProgram,
  extractProgramFromMultipleSources,
  type ExtractionResult,
} from './extractor'
import { createCandidate, type CreateCandidateResult } from './candidate'

export interface RunSourceResult {
  import_run_id: string
  source_id: string
  result: 'success' | 'unchanged' | 'fetch_error' | 'extraction_error'
  fetch: FetchResult
  extraction?: ExtractionResult
  candidate?: CreateCandidateResult
}

/**
 * Fetch one ImportSource and write an ImportRun row recording the outcome.
 *
 * - On `unchanged`, raw_html_gz is null to save storage.
 * - On `success`, raw_html_gz holds the gzipped body and the source's
 *   last_fetched_at + last_content_hash are updated.
 * - When `extract` is true and fetch succeeds, runs the LLM extractor and
 *   records model/token usage on the ImportRun row.
 */
export async function runFetchForSource(
  source: ImportSource,
  opts?: { extract?: boolean },
): Promise<RunSourceResult> {
  const started_at = new Date()
  const fetch = await fetchSource(source.url, source.last_content_hash)

  const base = {
    import_source_id: source.id,
    started_at,
    finished_at: new Date(),
  }

  if (fetch.kind === 'success') {
    const run = await prisma.importRun.create({
      data: {
        ...base,
        result: 'success',
        http_status: fetch.http_status,
        content_hash: fetch.content_hash,
        raw_html_gz: fetch.raw_html_gz as Uint8Array<ArrayBuffer>,
        raw_html_size: fetch.raw_html_size,
      },
      select: { id: true },
    })
    await prisma.importSource.update({
      where: { id: source.id },
      data: {
        last_fetched_at: base.finished_at,
        last_content_hash: fetch.content_hash,
      },
    })

    // Optional LLM extraction on successful fetch
    if (opts?.extract) {
      const extraction = await extractProgram(fetch.raw_html)
      await prisma.importRun.update({
        where: { id: run.id },
        data: {
          extraction_model: extraction.model,
          extraction_tokens_in: extraction.tokens_in,
          extraction_tokens_out: extraction.tokens_out,
          ...(extraction.kind === 'error' && {
            result: 'extraction_error',
            error_message: extraction.message,
          }),
        },
      })

      if (extraction.kind === 'error') {
        return {
          import_run_id: run.id,
          source_id: source.id,
          result: 'extraction_error',
          fetch,
          extraction,
        }
      }

      // Successful extraction → create candidate for human review
      const candidate = await createCandidate(extraction, source.id, run.id)
      return {
        import_run_id: run.id,
        source_id: source.id,
        result: 'success',
        fetch,
        extraction,
        candidate,
      }
    }

    return { import_run_id: run.id, source_id: source.id, result: 'success', fetch }
  }

  if (fetch.kind === 'unchanged') {
    const run = await prisma.importRun.create({
      data: {
        ...base,
        result: 'unchanged',
        http_status: fetch.http_status,
        content_hash: fetch.content_hash,
      },
      select: { id: true },
    })
    await prisma.importSource.update({
      where: { id: source.id },
      data: { last_fetched_at: base.finished_at },
    })
    return { import_run_id: run.id, source_id: source.id, result: 'unchanged', fetch }
  }

  const http_status = fetch.kind === 'fetch_error' ? fetch.http_status : null
  const run = await prisma.importRun.create({
    data: {
      ...base,
      result: 'fetch_error',
      http_status: http_status ?? undefined,
      error_message: fetch.message,
    },
    select: { id: true },
  })
  return { import_run_id: run.id, source_id: source.id, result: 'fetch_error', fetch }
}

// ---------------------------------------------------------------------------
// Multi-source fetch + combined extraction for a single program
// ---------------------------------------------------------------------------

export interface RunProgramResult {
  program_id: string
  sources_fetched: number
  sources_changed: number
  sources_failed: number
  extraction?: ExtractionResult
  candidate?: CreateCandidateResult
}

/**
 * Fetch all ImportSources linked to a program, then run a single combined
 * LLM extraction across all successfully fetched pages. This produces a
 * more complete picture than extracting each source independently.
 *
 * Individual ImportRun rows are still created per source for tracking.
 * The combined extraction creates one ProgramCandidate linked to the
 * first source (as a representative anchor).
 */
export async function runFetchForProgram(
  programId: string,
  sources: ImportSource[],
): Promise<RunProgramResult> {
  const result: RunProgramResult = {
    program_id: programId,
    sources_fetched: 0,
    sources_changed: 0,
    sources_failed: 0,
  }

  // Fetch each source independently, recording ImportRun rows
  const fetchedPages: Array<{ label: string; html: string; sourceId: string; runId: string }> = []

  for (const source of sources) {
    const r = await runFetchForSource(source)
    result.sources_fetched++

    if (r.result === 'success') {
      result.sources_changed++
      // Retrieve the raw HTML from the fetch result
      if (r.fetch.kind === 'success') {
        fetchedPages.push({
          label: source.name,
          html: r.fetch.raw_html,
          sourceId: source.id,
          runId: r.import_run_id,
        })
      }
    } else if (r.result === 'fetch_error') {
      result.sources_failed++
    }
    // unchanged sources: check if we have stored HTML from a previous run
    if (r.result === 'unchanged') {
      const lastRun = await prisma.importRun.findFirst({
        where: { import_source_id: source.id, result: 'success', raw_html_gz: { not: null } },
        orderBy: { started_at: 'desc' },
        select: { id: true, raw_html_gz: true },
      })
      if (lastRun?.raw_html_gz) {
        const { gunzipSync } = await import('node:zlib')
        const html = gunzipSync(Buffer.from(lastRun.raw_html_gz)).toString('utf-8')
        fetchedPages.push({
          label: source.name,
          html,
          sourceId: source.id,
          runId: r.import_run_id,
        })
      }
    }
  }

  // Need at least one page with content to extract
  if (fetchedPages.length === 0) return result

  // Run combined extraction
  const extraction = await extractProgramFromMultipleSources(
    fetchedPages.map((p) => ({ label: p.label, html: p.html })),
  )
  result.extraction = extraction

  // Record extraction metadata on the first run that had new content
  const anchorPage = fetchedPages[0]
  await prisma.importRun.update({
    where: { id: anchorPage.runId },
    data: {
      extraction_model: extraction.model,
      extraction_tokens_in: extraction.tokens_in,
      extraction_tokens_out: extraction.tokens_out,
      ...(extraction.kind === 'error' && {
        result: 'extraction_error',
        error_message: extraction.message,
      }),
    },
  })

  if (extraction.kind === 'success') {
    const candidate = await createCandidate(extraction, anchorPage.sourceId, anchorPage.runId)
    result.candidate = candidate
  }

  return result
}
