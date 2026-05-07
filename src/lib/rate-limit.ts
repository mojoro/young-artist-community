import { extractIp, hashIp } from './ip-hash'

const buckets = new Map<string, number[]>()

interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
}

export function rateLimit(opts: { key: string; windowMs: number; max: number }): RateLimitResult {
  const now = Date.now()
  const cutoff = now - opts.windowMs
  const recent = (buckets.get(opts.key) ?? []).filter((t) => t > cutoff)

  if (recent.length >= opts.max) {
    const oldest = recent[0]
    return { allowed: false, retryAfterMs: Math.max(0, oldest + opts.windowMs - now) }
  }

  recent.push(now)
  buckets.set(opts.key, recent)

  if (Math.random() < 0.01) gc(cutoff)

  return { allowed: true, retryAfterMs: 0 }
}

function gc(cutoff: number): void {
  for (const [k, v] of buckets) {
    const filtered = v.filter((t) => t > cutoff)
    if (filtered.length === 0) buckets.delete(k)
    else buckets.set(k, filtered)
  }
}

export async function rateLimitByIp(
  headerStore: Headers,
  action: string,
  opts: { windowMs: number; max: number },
): Promise<RateLimitResult> {
  const ip = extractIp(headerStore)
  const ip_hash = await hashIp(ip)
  return rateLimit({ key: `${action}:${ip_hash}`, ...opts })
}

export function _resetRateLimitForTests(): void {
  buckets.clear()
}
