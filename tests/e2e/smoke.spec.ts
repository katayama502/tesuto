import { expect, test } from '@playwright/test';

test('pair matching flow returns bundles', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'マッチングを見る' }).click();
  await page.waitForURL('**/results**');
  const cards = page.locator('article');
  await expect.poll(async () => cards.count()).toBeGreaterThan(5);
  await expect(cards.first()).toContainText('マッチスコア');
});
