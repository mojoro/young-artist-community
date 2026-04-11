export type SortDirection = 'asc' | 'desc'

export interface SortField {
  field: string
  direction: SortDirection
}

export function parseSort(value: string | null | undefined): SortField[] {
  if (!value) return []
  return value
    .split(',')
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      if (raw.startsWith('-')) {
        return { field: raw.slice(1), direction: 'desc' as const }
      }
      return { field: raw, direction: 'asc' as const }
    })
}

export function toPrismaOrderBy<T extends string>(
  sortFields: SortField[],
  allowed: readonly T[],
  fallback: Record<string, SortDirection> = { created_at: 'desc' },
): Array<Record<string, SortDirection>> {
  const set = new Set<string>(allowed)
  const filtered = sortFields.filter((s) => set.has(s.field))
  if (filtered.length === 0) return [fallback]
  return filtered.map((s) => ({ [s.field]: s.direction }))
}
