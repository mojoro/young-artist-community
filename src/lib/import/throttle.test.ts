import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.useFakeTimers()

beforeEach(() => {
  vi.resetModules()
})

describe('waitForHostSlot', () => {
  it('resolves immediately on first call for a host', async () => {
    const { waitForHostSlot } = await import('@/lib/import/throttle')
    const before = Date.now()
    await waitForHostSlot('https://first-call.com/page')
    expect(Date.now() - before).toBeLessThan(100)
  })

  it('delays second call to same host by PER_HOST_DELAY_MS', async () => {
    const { waitForHostSlot } = await import('@/lib/import/throttle')

    await waitForHostSlot('https://delay-test.com/a')

    const promise = waitForHostSlot('https://delay-test.com/b')
    await vi.advanceTimersByTimeAsync(5000)
    await promise
  })

  it('does not delay calls to different hosts', async () => {
    const { waitForHostSlot } = await import('@/lib/import/throttle')

    await waitForHostSlot('https://host-a.com/page')
    const before = Date.now()
    await waitForHostSlot('https://host-b.com/page')
    expect(Date.now() - before).toBeLessThan(100)
  })

  it('resolves immediately when enough time has passed naturally', async () => {
    const { waitForHostSlot } = await import('@/lib/import/throttle')

    await waitForHostSlot('https://natural.com/a')
    await vi.advanceTimersByTimeAsync(5000)
    const before = Date.now()
    await waitForHostSlot('https://natural.com/b')
    expect(Date.now() - before).toBeLessThan(100)
  })
})
