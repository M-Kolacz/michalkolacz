import { expect, test } from '#tests/playwright-utils.ts'

test('Test root error boundary caught', async ({ page }) => {
	await page.goto('/')

	await expect(
		page.getByRole('heading', {
			name: /Michal Kolacz/i,
		}),
	).toBeVisible()
})
