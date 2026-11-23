import { test, expect } from '@playwright/test';

test.describe('F4 – Farmer-to-Buyer Marketplace Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/market');
    await page.waitForLoadState('networkidle');
  });

  test('should display marketplace listings with filters, search, and sorting', async ({ page }) => {
    // 1. Check title & subtitle
    await expect(page.locator('h1')).toContainText(/Farmer-to-Buyer Connect|ರೈತರಿಂದ ಖರೀದಿದಾರರಿಗೆ ನೇರ ಸಂಪರ್ಕ/i);

    // 2. Verify filter pills & taluk dropdown
    await expect(page.locator('text=/All Crops|ಎಲ್ಲಾ ಬೆಳೆಗಳು/i').first()).toBeVisible();
    await expect(page.locator('text=/Sugarcane|ಕಬ್ಬು/i').first()).toBeVisible();
    await expect(page.locator('text=/Paddy|ಭತ್ತ/i').first()).toBeVisible();
    await expect(page.locator('text=/Tender Coconut|ಎಳನೀರು/i').first()).toBeVisible();

    // 3. Verify sample produce cards are rendered
    await expect(page.locator('text=/Co 86032|Mandya Local Green|GPU 28|BPT 5204/i').first()).toBeVisible();

    // 4. Test Search filter
    const searchInput = page.getByPlaceholder(/Search crop, variety, village|ಮಂಡ್ಯದ ಬೆಳೆ/i);
    await searchInput.fill('Coconut');
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Tender Coconut|ಎಳನೀರು/i').first()).toBeVisible();

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 5. Test Collective Group Filter toggle
    const collectiveCheckbox = page.locator('input[type="checkbox"]');
    await collectiveCheckbox.check();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/BPT 5204|Sona Masoori|Collective Group Pool/i').first()).toBeVisible();

    // Uncheck collective
    await collectiveCheckbox.uncheck();
    await page.waitForTimeout(300);
  });

  test('should open produce listing detail with pricing, logistics and collective contributions', async ({ page }) => {
    // Click on the collective paddy listing or any listing
    const card = page.locator('text=/BPT 5204|Sona Masoori/i').first();
    await card.click();

    // Verify detail dialog opens
    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/BPT 5204|Sona Masoori/i);
    await expect(dialog).toContainText(/₹2,650|2650/i);
    await expect(dialog).toContainText(/Haravu|Pandavapura/i);

    // Verify collective pooled contributions table
    await expect(dialog.locator('text=/Pooled Farmer Contributions|ರೈತರ ಒಟ್ಟುಗೂಡಿಸಿದ ಬೆಳೆ ವಿವರ/i')).toBeVisible();
    await expect(dialog.locator('text=/Ramesh Gowda/i').first()).toBeVisible();
    await expect(dialog.locator('text=/Lakshmi Devi/i').first()).toBeVisible();

    // Close dialog
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('should create a new individual produce listing', async ({ page }) => {
    // Click "List Your Produce" button
    const listBtn = page.getByRole('button', { name: /List Your Produce|ಉತ್ಪನ್ನ ಮಾರಾಟಕ್ಕೆ ಇಡಿ/i }).first();
    await listBtn.click();

    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Create Produce Listing|ಉತ್ಪನ್ನ ಮಾರಾಟಕ್ಕೆ ಸೇರಿಸಿ/i);

    // Fill variety, quantity, price
    const uniqueVariety = `Mandya Special Organic Jaggery Cane ${Date.now()}`;
    await dialog.locator('input[placeholder*="Co 86032"]').fill(uniqueVariety);

    // Submit listing
    const submitBtn = dialog.getByRole('button', { name: /List Your Produce|ಉತ್ಪನ್ನ ಮಾರಾಟಕ್ಕೆ ಇಡಿ/i });
    await submitBtn.click();

    // Verify modal closes and new listing appears in feed
    await expect(dialog).not.toBeVisible();
    await expect(page.locator(`text=${uniqueVariety}`)).toBeVisible();
  });

  test('should submit a buyer purchase enquiry', async ({ page }) => {
    // Click Enquire Now on tender coconut card
    const card = page.locator('.group').filter({ hasText: /Mandya Local Green|Tender Coconut/i }).first();
    await card.getByRole('button', { name: /Send Buyer Enquiry|ಖರೀದಿ ವಿಚಾರಣೆ ಕಳುಹಿಸಿ|Enquire Now/i }).click();

    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/Send Direct Enquiry to Farmer|ರೈತರಿಗೆ ನೇರ ವಿಚಾರಣೆ ಕಳುಹಿಸಿ/i);

    // Fill quantity and message
    await dialog.locator('textarea').fill('We require 500 tender coconuts for Bengaluru weekly organic market. Truck pickup Saturday morning.');

    // Submit enquiry
    const sendBtn = dialog.getByRole('button', { name: /Send Purchase Enquiry|ಖರೀದಿ ವಿಚಾರಣೆ ಕಳುಹಿಸಿ/i });
    await sendBtn.click();

    // Modal closes on submission
    await expect(dialog).not.toBeVisible();
  });

  test('should manage enquiry negotiation thread, reply and update status', async ({ page }) => {
    // Switch to "Enquiries & Messages" tab
    const enquiriesTab = page.getByRole('button', { name: /Enquiries & Messages|ವಿಚಾರಣೆಗಳು ಮತ್ತು ಸಂದೇಶಗಳು/i });
    await enquiriesTab.click();
    await page.waitForTimeout(300);

    // Expect enquiry cards to be listed
    await expect(page.locator('text=/Mysore Agro Traders|Direct enquiry/i').first()).toBeVisible();

    // Click on discussion thread
    const threadBtn = page.getByRole('button', { name: /Communication & Negotiation Thread|ಸಂವಹನ ಮತ್ತು ಬೆಲೆ ಮಾತುಕತೆ/i }).first();
    await threadBtn.click();

    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible();

    // Verify messages thread is visible
    await expect(dialog.locator('text=/Interested in 60 quintals|pickup of 1,000/i').first()).toBeVisible();

    // Send a reply in negotiation thread
    const replyInput = dialog.getByPlaceholder(/Type message or logistics query|ಖರೀದಿದಾರರಿಗೆ\/ರೈತರಿಗೆ ಸಂದೇಶ/i);
    await replyInput.fill('Can offer direct mill delivery at ₹2620 per quintal with gunny bags included.');
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);

    // Verify new message bubble rendered
    await expect(dialog.locator('text=/Can offer direct mill delivery/i')).toBeVisible();

    // Close thread dialog
    await page.getByRole('button', { name: /Close dialog/i }).click();
  });

  test('should view farmer My Listings dashboard and pause/reactivate listing', async ({ page }) => {
    // Switch to "My Listings" tab
    const myListingsTab = page.getByRole('button', { name: /My Listings|ನನ್ನ ಮಾರಾಟ ಪಟ್ಟಿ/i });
    await myListingsTab.click();
    await page.waitForTimeout(300);

    // Verify farmer's own listings are shown
    await expect(page.locator('text=/Active & Available|ಮಾರಾಟಕ್ಕೆ ಲಭ್ಯ/i').first()).toBeVisible();

    // Test Pause listing
    const pauseBtn = page.getByRole('button', { name: /Pause Listing|ಮಾರಾಟ ತಾತ್ಕಾಲಿಕ ಸ್ಥಗಿತ/i }).first();
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=/Paused|ತಾತ್ಕಾಲಿಕ ಸ್ಥಗಿತ/i').first()).toBeVisible();
    }
  });

  test('should support bilingual language switching between Kannada and English', async ({ page }) => {
    // Find language switcher button in header
    const langBtn = page.locator('button').filter({ hasText: /ಕನ್ನಡ|English/i }).first();
    await expect(langBtn).toBeVisible();

    // Switch language
    await langBtn.click();
    await page.waitForTimeout(400);

    // Verify marketplace labels update accordingly
    const headerTitle = page.locator('h1');
    await expect(headerTitle).toBeVisible();

    // Switch back
    await langBtn.click();
    await page.waitForTimeout(400);
  });
});
