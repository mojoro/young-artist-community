import { prisma } from '@/lib/prisma'
import type { ExtractionSuccess } from './extractor'

export interface CreateCandidateResult {
  candidate_id: string
  matched_program_id: string | null
}

/**
 * Create a ProgramCandidate row from a successful extraction.
 *
 * Attempts to match the extracted program against existing programs using
 * case-insensitive name comparison + optional city overlap. If a match is
 * found, the candidate's program_id is set so the admin reviewer sees the
 * link. The candidate always starts in "pending" status regardless.
 */
export async function createCandidate(
  extraction: ExtractionSuccess,
  sourceId: string,
  runId: string,
): Promise<CreateCandidateResult> {
  const matchedProgramId = await findMatchingProgram(extraction)

  const candidate = await prisma.programCandidate.create({
    data: {
      import_source_id: sourceId,
      import_run_id: runId,
      program_id: matchedProgramId,
      extracted_json: extraction.program as object,
      confidence: extraction.confidence,
      status: 'pending',
    },
    select: { id: true },
  })

  return {
    candidate_id: candidate.id,
    matched_program_id: matchedProgramId,
  }
}

/**
 * Find an existing program that likely matches the extracted data.
 *
 * Strategy (simple, fits ~1000-row dataset):
 * 1. Normalize the extracted name (lowercase, trim, collapse whitespace).
 * 2. Search for programs whose name matches case-insensitively.
 * 3. Among name matches, prefer ones that share a city with the extraction.
 * 4. If multiple matches remain, pick the one with the most recent update.
 *
 * Returns the matched program ID or null if no match.
 */
async function findMatchingProgram(
  extraction: ExtractionSuccess,
): Promise<string | null> {
  const name = normalize(extraction.program.name)
  if (!name) return null

  // Case-insensitive search via Prisma's `mode: 'insensitive'`
  const candidates = await prisma.program.findMany({
    where: {
      name: { equals: extraction.program.name, mode: 'insensitive' },
    },
    select: {
      id: true,
      name: true,
      updated_at: true,
      program_locations: {
        select: {
          location: { select: { city: true, country: true } },
        },
      },
    },
  })

  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0].id

  // Multiple name matches — score by city overlap
  const extractedCities = new Set(
    extraction.program.locations.map((l) => normalize(l.city)),
  )

  if (extractedCities.size > 0) {
    const withCityMatch = candidates.filter((c) =>
      c.program_locations.some((pl) =>
        extractedCities.has(normalize(pl.location.city)),
      ),
    )
    if (withCityMatch.length === 1) return withCityMatch[0].id
    if (withCityMatch.length > 1) {
      // Multiple city matches — pick most recently updated
      withCityMatch.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
      return withCityMatch[0].id
    }
  }

  // No city overlap — pick most recently updated
  candidates.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
  return candidates[0].id
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}
