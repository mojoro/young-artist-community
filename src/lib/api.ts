import { headers } from 'next/headers'
import type {
  BareListResponse,
  Category,
  Instrument,
  ListResponse,
  Location,
  Program,
  Review,
  Audition,
} from './types'

async function apiBase(): Promise<string> {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = await apiBase()
  return fetch(`${base}${path}`, { cache: 'no-store', ...init })
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GET ${path} failed: ${res.status} ${text}`)
  }
  return (await res.json()) as T
}

export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  const res = await apiFetch(path)
  if (res.status === 404) return null
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GET ${path} failed: ${res.status} ${text}`)
  }
  return (await res.json()) as T
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return ''
  const qs = new URLSearchParams()
  for (const [k, v] of entries) {
    qs.set(k, String(v))
  }
  return `?${qs.toString()}`
}

// ---- Typed helpers ------------------------------------------------------

export function listPrograms(query: string = ''): Promise<ListResponse<Program>> {
  return apiGet<ListResponse<Program>>(`/api/programs${query}`)
}

export function getProgram(id: string): Promise<Program | null> {
  return apiGetOrNull<Program>(`/api/programs/${id}`)
}

export function listProgramReviews(id: string, query: string = ''): Promise<ListResponse<Review>> {
  return apiGet<ListResponse<Review>>(`/api/programs/${id}/reviews${query}`)
}

export function listProgramAuditions(id: string, query: string = ''): Promise<ListResponse<Audition>> {
  return apiGet<ListResponse<Audition>>(`/api/programs/${id}/auditions${query}`)
}

export function listInstruments(): Promise<BareListResponse<Instrument>> {
  return apiGet<BareListResponse<Instrument>>('/api/instruments')
}

export function listCategories(): Promise<BareListResponse<Category>> {
  return apiGet<BareListResponse<Category>>('/api/categories')
}

export function listLocations(): Promise<BareListResponse<Location>> {
  return apiGet<BareListResponse<Location>>('/api/locations')
}
