import { test, expect } from '@playwright/test'

test.describe('review submission', () => {
  test('submits a review on a program detail page', async ({ page }) => {
    await page.goto('/programs')
    await page.locator('article').first().getByRole('link').first().click()
    await page.waitForURL(/\/programs\//)

    await page.getByLabel(/rating/i).selectOption('4')
    await page
      .getByLabel(/review/i)
      .fill('Great program with wonderful faculty and performance opportunities.')
    await page.getByRole('button', { name: /submit review/i }).click()

    // After submission the page reloads with the new review visible
    await expect(page.getByText('Great program with wonderful faculty')).toBeVisible({
      timeout: 10000,
    })
  })
})
