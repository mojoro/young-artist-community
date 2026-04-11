export const USER_AGENT = 'YACTrackerBot/1.0 (+https://yactracker.com/bot)'

// Minimum delay in milliseconds between two requests to the same host.
export const PER_HOST_DELAY_MS = 5_000

// How long to wait for a single HTTP request before giving up.
export const REQUEST_TIMEOUT_MS = 30_000

// Robots.txt cache lifetime (in-memory, per-process).
export const ROBOTS_CACHE_TTL_MS = 15 * 60_000
