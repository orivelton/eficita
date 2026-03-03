import { test, expect, Page } from '@playwright/test'

import { test, expect, Page } from '@playwright/test'
import { seedTestUser } from './helpers/seedUser'
import { DEMO_CREDENTIALS } from '../../src/lib/auth'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Payload Blank Template/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Welcome to your new project.')
  })

  test('can login with demo credentials', async () => {
    await page.goto('http://localhost:3000')
    // open login modal/page
    await page.click('button:has-text("Entrar")')
    await page.fill('#email', DEMO_CREDENTIALS.email)
    await page.fill('#password', DEMO_CREDENTIALS.password)
    await page.click('button[type="submit"]')

    // after login we should see dashboard header
    await expect(page.locator('h1')).toHaveText('Painel')
  })
})
