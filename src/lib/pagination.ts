export interface PaginationParams {
  page_number: number
  page_size: number
  skip: number
  take: number
}

export interface PaginationMeta {
  page_number: number
  page_size: number
  total_pages: number
  total_items: number
}

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const rawNumber = searchParams.get('page[number]') ?? searchParams.get('page_number') ?? '0'
  const rawSize = searchParams.get('page[size]') ?? searchParams.get('page_size') ?? String(DEFAULT_PAGE_SIZE)

  const pageNumber = Math.max(0, parseIntSafe(rawNumber, 0))
  const pageSize = clamp(parseIntSafe(rawSize, DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE)

  return {
    page_number: pageNumber,
    page_size: pageSize,
    skip: pageNumber * pageSize,
    take: pageSize,
  }
}

export function buildMeta(params: PaginationParams, totalItems: number): PaginationMeta {
  const totalPages = params.page_size > 0 ? Math.ceil(totalItems / params.page_size) : 0
  return {
    page_number: params.page_number,
    page_size: params.page_size,
    total_pages: totalPages,
    total_items: totalItems,
  }
}

function parseIntSafe(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
