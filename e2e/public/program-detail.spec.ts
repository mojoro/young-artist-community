import { test, expect } from '@playwright/test'

test.describe('program detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/programs')
    await page.locator('article').first().getByRole('link').first().click()
    await page.waitForURL(/\/programs\//)
  })

  test('navigates from listing and shows program heading', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('reviews section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^Reviews/ })).toBeVisible()
  })

  test('review form has rating and body fields', async ({ page }) => {
    await expect(page.getByLabel(/rating/i)).toBeVisible()
    await expect(page.getByLabel(/review/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /submit review/i })).toBeVisible()
  })

  test('key facts section is present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /key facts/i })).toBeVisible()
  })
})
