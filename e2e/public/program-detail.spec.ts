import { test, expect } from '@playwright/test'

test.describe('program detail page', () => {
  test('navigates from program listing to detail page', async ({ page }) => {
    await page.goto('/programs')

    const firstCard = page.locator('article').first()
    const programName = await firstCard.locator('h2 a').innerText()

    await firstCard.locator('h2 a').click()
    await page.waitForURL(/\/programs\//)

    await expect(page.getByRole('heading', { level: 1, name: programName })).toBeVisible()
  })

  test('reviews section is visible', async ({ page }) => {
    await page.goto('/programs')
    await page.locator('article').first().locator('h2 a').click()
    await page.waitForURL(/\/programs\//)

    await expect(page.getByRole('heading', { name: /^Reviews/ })).toBeVisible()
  })

  test('review form has rating select and body textarea', async ({ page }) => {
    await page.goto('/programs')
    await page.locator('article').first().locator('h2 a').click()
    await page.waitForURL(/\/programs\//)

    await expect(page.locator('select#rating')).toBeVisible()
    await expect(page.locator('textarea#body')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit review' })).toBeVisible()
  })

  test('key facts section is present', async ({ page }) => {
    await page.goto('/programs')
    await page.locator('article').first().locator('h2 a').click()
    await page.waitForURL(/\/programs\//)

    await expect(page.getByRole('heading', { name: 'Key facts' })).toBeVisible()
  })
})
