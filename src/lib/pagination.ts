/**
 * Cursor pagination (opaque offset under the hood).
 *
 * The external query shape is Zalando-aligned: `cursor` (opaque string) +
 * `limit` (int). The cursor is an internally-defined base64url JSON token
 * that currently encodes only `{ offset: N }`. Clients must treat it as
 * opaque — we reserve the right to change the encoding.
 *
 * yactracker is a small-dataset project (≤ ~1000 rows) so we keep
 * `total_items` in the meta even though cursor meta typically omits totals.
 * This is a deliberate pragmatic deviation from the spec — see
 * `memory/feedback_pragmatic_spec_compliance.md`.
 */

export interface PaginationParams {
  offset: number
  limit: number
  skip: number
  take: number
}

export interface CursorPageMeta {
  next: string | null
  prev: string | null
  total_items: number
}

interface CursorPayload {
  offset: number
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const rawLimit = searchParams.get('limit') ?? String(DEFAULT_LIMIT)
  const limit = clamp(parseIntSafe(rawLimit, DEFAULT_LIMIT), 1, MAX_LIMIT)

  const rawCursor = searchParams.get('cursor')
  const cursorOffset = rawCursor ? decodeCursor(rawCursor)?.offset : undefined
  const offset = Math.max(0, cursorOffset ?? 0)

  return { offset, limit, skip: offset, take: limit }
}

export function buildMeta(params: PaginationParams, totalItems: number): CursorPageMeta {
  const { offset, limit } = params
  const nextOffset = offset + limit
  const hasNext = nextOffset < totalItems
  const hasPrev = offset > 0

  return {
    next: hasNext ? encodeCursor({ offset: nextOffset }) : null,
    prev: hasPrev ? encodeCursor({ offset: Math.max(0, offset - limit) }) : null,
    total_items: totalItems,
  }
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

export function decodeCursor(token: string): CursorPayload | null {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf8')
    const parsed = JSON.parse(json) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { offset?: unknown }).offset === 'number' &&
      Number.isFinite((parsed as { offset: number }).offset)
    ) {
      return { offset: Math.max(0, Math.floor((parsed as { offset: number }).offset)) }
    }
    return null
  } catch {
    return null
  }
}

function parseIntSafe(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
