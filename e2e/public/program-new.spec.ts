import { test, expect } from '@playwright/test'

test('program submission page loads', async ({ page }) => {
  await page.goto('/programs/new')
  await expect(page.getByRole('heading', { level: 1, name: /submit a program/i })).toBeVisible()
})
