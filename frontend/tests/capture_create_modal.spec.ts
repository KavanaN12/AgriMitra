import { test, expect } from '@playwright/test';
import * as path from 'path';

test('Capture Create Listing Modal Crop Selector', async ({ page }) => {
  test.setTimeout(45000);
  const screenshotDir = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

  await page.goto('http://localhost:8000/login');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();

  await page.fill('input[type="text"]', 'kavana.farmer@example.com');
  await page.fill('input[type="password"]', 'KavanaFarmer@2026');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:8000/market');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Click List Your Produce
  const btn = page.locator('button').filter({ hasText: /List Your Produce/i }).first();
  await btn.click();
  await page.waitForTimeout(1000);

  const dialog = page.locator('.fixed.inset-0 [role="dialog"]');
  await expect(dialog).toBeVisible();

  // Scroll dialog to produce photo section
  await dialog.evaluate((el) => {
    el.scrollTop = 300;
  });
  await page.waitForTimeout(500);

  // Screenshot modal dialog
  await page.screenshot({ path: path.join(screenshotDir, 'marketplace_create_listing_modal_full.png') });
  await dialog.screenshot({ path: path.join(screenshotDir, 'marketplace_create_listing_modal_card.png') });
  console.log('✓ Captured create listing modal dialog');
});
