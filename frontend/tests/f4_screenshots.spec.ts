import { test } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('F4 Marketplace Visual Verification', () => {
  test('capture F4 desktop screens', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    // 1. Marketplace Browse Desktop
    await page.locator('.group').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_marketplace_browse_desktop.png'), fullPage: true });

    // 2. Listing Detail Modal Desktop (Collective paddy lot with pooled contributions)
    const collectiveCard = page.locator('.group').filter({ hasText: /BPT 5204|Sona Masoori|Paddy/i }).first();
    if (await collectiveCard.isVisible()) {
      await collectiveCard.click();
    } else {
      await page.locator('.group').first().click();
    }
    const detailDialog = page.locator('role=dialog');
    await detailDialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_listing_detail_desktop.png') });
    await detailDialog.getByRole('button', { name: 'Close', exact: true }).click();
    await detailDialog.waitFor({ state: 'hidden' });
    await page.waitForTimeout(300);

    // 3. Create Listing Modal Desktop
    const newListingBtn = page.getByRole('button', { name: /List Your Produce|ಉತ್ಪನ್ನ ಮಾರಾಟಕ್ಕೆ ಇಡಿ/i }).first();
    await newListingBtn.click();
    const createDialog = page.locator('role=dialog');
    await createDialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_create_listing_desktop.png') });
    await createDialog.getByRole('button', { name: /Cancel|ರದ್ದು/i }).click();
    await createDialog.waitFor({ state: 'hidden' });
    await page.waitForTimeout(300);

    // 4. Enquiries & Negotiation Thread Desktop
    const enquiriesTab = page.getByRole('button', { name: /Enquiries & Messages|ವಿಚಾರಣೆಗಳು ಮತ್ತು ಸಂದೇಶಗಳು/i });
    await enquiriesTab.click();
    await page.waitForTimeout(500);

    const threadBtn = page.locator('button').filter({ hasText: /Communication & Negotiation Thread|ಸಂವಹನ ಮತ್ತು ಬೆಲೆ ಮಾತುಕತೆ/i }).first();
    if (await threadBtn.isVisible()) {
      await threadBtn.click();
      const threadDialog = page.locator('role=dialog');
      await threadDialog.waitFor({ state: 'visible' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_enquiry_thread_desktop.png') });
      await threadDialog.getByRole('button', { name: 'Close dialog' }).click();
      await threadDialog.waitFor({ state: 'hidden' });
      await page.waitForTimeout(300);
    }

    // 5. My Listings Dashboard Desktop
    const myListingsTab = page.getByRole('button', { name: /My Listings|ನನ್ನ ಮಾರಾಟ ಪಟ್ಟಿ/i });
    await myListingsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_my_listings_desktop.png'), fullPage: true });
  });

  test('capture F4 mobile screens', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/market');
    await page.waitForLoadState('networkidle');

    // 1. Marketplace Browse Mobile
    await page.locator('.group').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_marketplace_browse_mobile.png'), fullPage: true });

    // 2. Listing Detail Modal Mobile
    await page.locator('.group').first().click();
    const detailDialog = page.locator('role=dialog');
    await detailDialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_listing_detail_mobile.png') });
    await detailDialog.getByRole('button', { name: 'Close', exact: true }).click();
    await detailDialog.waitFor({ state: 'hidden' });
    await page.waitForTimeout(300);

    // 3. Enquiries Thread Mobile
    const enquiriesTab = page.getByRole('button', { name: /Enquiries & Messages|ವಿಚಾರಣೆಗಳು ಮತ್ತು ಸಂದೇಶಗಳು/i });
    await enquiriesTab.click();
    await page.waitForTimeout(500);
    const threadBtn = page.locator('button').filter({ hasText: /Communication & Negotiation Thread|ಸಂವಹನ ಮತ್ತು ಬೆಲೆ ಮಾತುಕತೆ/i }).first();
    if (await threadBtn.isVisible()) {
      await threadBtn.click();
      const threadDialog = page.locator('role=dialog');
      await threadDialog.waitFor({ state: 'visible' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f4_enquiry_thread_mobile.png') });
      await threadDialog.getByRole('button', { name: 'Close dialog' }).click();
    }
  });
});
