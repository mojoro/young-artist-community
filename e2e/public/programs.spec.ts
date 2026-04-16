import { test, expect } from '@playwright/test'

test.describe('Programs listing page', () => {
  test('renders the page heading', async ({ page }) => {
    await page.goto('/programs')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('renders filter controls', async ({ page }) => {
    await page.goto('/programs')
    await expect(page.getByLabel(/instrument/i)).toBeVisible()
    await expect(page.getByLabel(/category/i)).toBeVisible()
    await expect(page.getByLabel(/search/i)).toBeVisible()
  })

  test('displays at least one program card', async ({ page }) => {
    await page.goto('/programs')
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('view toggle switches between card and list views', async ({ page }) => {
    await page.goto('/programs')

    await expect(page.locator('article').first()).toBeVisible()

    await page.getByRole('link', { name: 'List view' }).click()
    await page.waitForURL(/view=list/)
    await expect(page.locator('table')).toBeVisible()

    await page.getByRole('link', { name: 'Card view' }).click()
    await expect(page.locator('article').first()).toBeVisible()
  })
})
