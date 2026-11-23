import { test } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('F4 Remaining Visual Captures', () => {
  test('capture My Listings desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    const myListingsTab = page.getByRole('button', { name: /My Listings|ನನ್ನ ಮಾರಾಟ ಪಟ್ಟಿ/i });
    await myListingsTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_my_listings_desktop.png'), fullPage: true });
  });

  test('capture mobile detail and enquiry thread', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    // 1. Open Detail on Mobile using View Details button
    await page.getByRole('button', { name: 'View Details' }).first().waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('button', { name: 'View Details' }).first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_listing_detail_mobile.png') });

    // Close detail dialog via Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 2. Open Enquiries & Thread on Mobile
    const enquiriesTab = page.getByRole('button', { name: /Enquiries & Messages|ವಿಚಾರಣೆಗಳು ಮತ್ತು ಸಂದೇಶಗಳು/i });
    await enquiriesTab.click();
    await page.waitForTimeout(600);

    const threadBtn = page.locator('button').filter({ hasText: /Communication & Negotiation Thread|ಸಂವಹನ ಮತ್ತು ಬೆಲೆ ಮಾತುಕತೆ/i }).first();
    if (await threadBtn.isVisible()) {
      await threadBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_enquiry_thread_mobile.png') });
      await page.keyboard.press('Escape');
    }
  });
});
