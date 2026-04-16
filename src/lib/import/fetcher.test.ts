import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHash } from 'node:crypto'

vi.mock('@/lib/import/robots', () => ({
  isAllowed: vi.fn(),
}))

vi.mock('@/lib/import/throttle', () => ({
  waitForHostSlot: vi.fn(),
}))

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

import { isAllowed } from '@/lib/import/robots'
import { fetchSource } from '@/lib/import/fetcher'

const mockIsAllowed = isAllowed as ReturnType<typeof vi.fn>

function htmlResponse(body: string, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    text: () => Promise.resolve(body),
  })
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

beforeEach(() => {
  fetchMock.mockReset()
  mockIsAllowed.mockResolvedValue(true)
})

describe('fetchSource', () => {
  it('returns blocked_by_robots when robots.txt disallows', async () => {
    mockIsAllowed.mockResolvedValue(false)
    const result = await fetchSource('https://example.com/page', null)
    expect(result.kind).toBe('blocked_by_robots')
  })

  it('returns success with hash and html on first fetch', async () => {
    const html = '<html><body>Hello</body></html>'
    fetchMock.mockReturnValue(htmlResponse(html))

    const result = await fetchSource('https://example.com/page', null)
    expect(result.kind).toBe('success')
    if (result.kind === 'success') {
      expect(result.content_hash).toBe(sha256(html))
      expect(result.raw_html).toBe(html)
      expect(result.raw_html_size).toBe(Buffer.byteLength(html, 'utf8'))
      expect(result.raw_html_gz).toBeInstanceOf(Uint8Array)
    }
  })

  it('returns unchanged when content hash matches lastHash', async () => {
    const html = '<html>Same content</html>'
    const hash = sha256(html)
    fetchMock.mockReturnValue(htmlResponse(html))

    const result = await fetchSource('https://example.com/page', hash)
    expect(result.kind).toBe('unchanged')
    if (result.kind === 'unchanged') {
      expect(result.content_hash).toBe(hash)
    }
  })

  it('returns success when content hash differs from lastHash', async () => {
    fetchMock.mockReturnValue(htmlResponse('<html>New content</html>'))

    const result = await fetchSource('https://example.com/page', 'old-hash')
    expect(result.kind).toBe('success')
  })

  it('returns fetch_error on non-OK HTTP status', async () => {
    fetchMock.mockReturnValue(htmlResponse('Not Found', 404))

    const result = await fetchSource('https://example.com/missing', null)
    expect(result.kind).toBe('fetch_error')
    if (result.kind === 'fetch_error') {
      expect(result.http_status).toBe(404)
    }
  })

  it('returns fetch_error with null status on network error', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'))

    const result = await fetchSource('https://down.com/page', null)
    expect(result.kind).toBe('fetch_error')
    if (result.kind === 'fetch_error') {
      expect(result.http_status).toBeNull()
      expect(result.message).toContain('ECONNREFUSED')
    }
  })
})
