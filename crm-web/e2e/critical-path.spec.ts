import { test, expect } from '@playwright/test'

test('log in, search Amina, save an interaction, see it in the timeline', async ({ page }) => {
  await page.goto('http://localhost:5173')

  // Log in
  await page.getByLabel(/username/i).fill('agent1')
  await page.getByLabel(/password/i).fill('password') // replace with the real password if different
  await page.getByRole('button', { name: /sign in/i }).click()

  // Dashboard should load post-login
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

  // Search (client-side filter over the full customer list)
  await page.getByLabel(/search customers/i).fill('Amina')
  await page.getByRole('button', { name: /amina khan/i }).click()

  await expect(page.getByRole('heading', { name: /amina khan/i })).toBeVisible()

  const summaryText = `E2E test note ${Date.now()}`
  await page.getByLabel(/interaction summary/i).fill(summaryText)
  await page.getByRole('button', { name: /save interaction/i }).click()

  await expect(page.getByText(summaryText)).toBeVisible()
})