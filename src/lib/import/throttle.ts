import { PER_HOST_DELAY_MS } from './constants'

// Per-host last-request timestamp. In-memory, per-invocation.
const lastRequestAt = new Map<string, number>()

function hostOf(url: string): string {
  return new URL(url).host
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Wait until `PER_HOST_DELAY_MS` has elapsed since the last request to the
 * given URL's host, then record the new request time. Call this immediately
 * before issuing an HTTP request.
 */
export async function waitForHostSlot(url: string): Promise<void> {
  const host = hostOf(url)
  const last = lastRequestAt.get(host) ?? 0
  const now = Date.now()
  const elapsed = now - last
  if (elapsed < PER_HOST_DELAY_MS) {
    await sleep(PER_HOST_DELAY_MS - elapsed)
  }
  lastRequestAt.set(host, Date.now())
}
