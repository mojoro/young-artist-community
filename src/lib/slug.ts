/**
 * Convert a program name to a URL-friendly kebab-case slug.
 *
 * "Aspen Music Festival and School" → "aspen-music-festival-and-school"
 * "Académie du Festival d'Aix"      → "academie-du-festival-daix"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/['']/g, '')            // strip apostrophes
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')         // trim leading/trailing hyphens
}
