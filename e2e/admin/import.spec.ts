import { test, expect } from '@playwright/test'

test.describe('Admin import page', () => {
  test('page loads with candidates and sources sections', async ({ page }) => {
    await page.goto('/admin/import')
    await expect(page.getByRole('heading', { level: 1, name: /import review/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /sources/i })).toBeVisible()
  })
})
