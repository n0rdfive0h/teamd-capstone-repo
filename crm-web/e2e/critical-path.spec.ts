import { test, expect } from '@playwright/test'

test('search Amina, save an interaction, see it in the timeline', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await page.getByLabel(/find customer/i).fill('Amina')
  await page.getByRole('button', { name: /amina khan/i }).click()

  await expect(page.getByRole('heading', { name: /amina khan/i })).toBeVisible()

  const summaryText = `E2E test note ${Date.now()}`
  await page.getByLabel(/interaction summary/i).fill(summaryText)
  await page.getByRole('button', { name: /save interaction/i }).click()

  await expect(page.getByText(summaryText)).toBeVisible()
})