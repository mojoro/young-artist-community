import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads and main heading is visible', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('community-built directory')
  })

  test('program cards render in the recently updated section', async ({ page }) => {
    const section = page.getByRole('heading', { name: /recently updated/i }).locator('..')
    const cards = section.locator('..').locator('article')
    await expect(cards.first()).toBeVisible()
    expect(await cards.count()).toBeGreaterThanOrEqual(1)
  })

  test('search input exists', async ({ page }) => {
    const input = page.getByPlaceholder('Search programs...')
    expect(await input.count()).toBeGreaterThanOrEqual(1)
  })

  test('browse by category section has category links', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /browse by category/i })
    await expect(heading).toBeVisible()
    const section = heading.locator('..')
    const links = section.getByRole('link')
    await expect(links.first()).toBeVisible()
    expect(await links.count()).toBeGreaterThanOrEqual(1)

    // Each category link points to /programs with a category_id filter
    const href = await links.first().getAttribute('href')
    expect(href).toContain('/programs?category_id=')
  })

  test('community CTA links are present', async ({ page }) => {
    const cta = page
      .getByRole('heading', { name: /directory grows when you contribute/i })
      .locator('..')
    await expect(cta).toBeVisible()

    const reviewLink = cta.getByRole('link', { name: /write a review/i })
    await expect(reviewLink).toBeVisible()

    const submitLink = cta.getByRole('link', { name: /submit a program/i })
    await expect(submitLink).toBeVisible()
  })
})
