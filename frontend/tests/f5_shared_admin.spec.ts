import { test, expect } from '@playwright/test';

test.describe('F5 – Shared Features, Notifications, Settings & Administration', () => {

  test('1. Notification Center - Inbox, Filtering, Mark Read, Deep Linking & Preferences', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Open Notification Center via Header Bell
    const bellButton = page.locator('button[aria-label="View notifications"]');
    await expect(bellButton).toBeVisible();
    await bellButton.click();

    // Verify modal appears
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toContainText(/Notification Center|ಸೂಚನೆಗಳ ಕೇಂದ್ರ/i);

    // 2. Check category tabs
    const advisoryTab = modal.locator('text=/Advisories|ಬೆಳೆ ಸಲಹೆಗಳು/i').first();
    await advisoryTab.click();
    await page.waitForTimeout(300);
    await expect(modal.locator('text=/Sugarcane|ಕಬ್ಬು/i').first()).toBeVisible();

    const marketTab = modal.locator('text=/Marketplace|ಮಾರುಕಟ್ಟೆ/i').first();
    await marketTab.click();
    await page.waitForTimeout(300);
    await expect(modal.locator('text=/Enquiry|ವಿಚಾರಣೆ/i').first()).toBeVisible();

    // 3. Test Unread only filter
    const allTab = modal.locator('text=/All|ಎಲ್ಲವೂ/i').first();
    await allTab.click();
    const unreadCheckbox = modal.locator('input[type="checkbox"]').first();
    await unreadCheckbox.check();
    await page.waitForTimeout(200);
    await unreadCheckbox.uncheck();
    await page.waitForTimeout(200);

    // 4. Test Notification Preferences Tab
    const prefButton = modal.locator('button[title="Notification Settings"]');
    await prefButton.click();
    await page.waitForTimeout(300);
    await expect(modal.locator('text=/Notification Preferences|ಸೂಚನಾ ಆದ್ಯತೆಗಳು/i')).toBeVisible();

    // Toggle a preference
    const advisoryPrefCheckbox = modal.locator('input[type="checkbox"]').first();
    await advisoryPrefCheckbox.click();
    await page.waitForTimeout(300);

    // Switch back to All notifications
    await allTab.click();

    // 5. Test Deep Link Navigation
    const viewDetailsBtn = modal.locator('button:has-text("View Details"), button:has-text("ವಿವರ ವೀಕ್ಷಿಸಿ")').first();
    if (await viewDetailsBtn.isVisible()) {
      await viewDetailsBtn.click();
      await page.waitForTimeout(500);
      // Verify navigated away from modal and modal is closed
      await expect(modal).not.toBeVisible();
    }
  });

  test('2. User Profile & Settings - Personal, Farm Details, Accessibility & Languages', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // 1. Verify user profile card
    await expect(page.locator('h1')).toContainText(/Ramesh Gowda/i);
    await expect(page.locator('text=/Verified|ದೃಢೀಕೃತ/i').first()).toBeVisible();

    // 2. Edit Profile Details
    const bioTextarea = page.locator('textarea');
    await bioTextarea.fill('Natural sugarcane farmer promoting organic practices across Maddur taluk.');

    // Toggle phone number visibility
    const phoneVisibleCheckbox = page.locator('input[type="checkbox"]').first();
    await phoneVisibleCheckbox.click();

    // Click Save Changes
    const saveBtn = page.locator('button:has-text("Save Changes"), button:has-text("ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ")').first();
    await saveBtn.click();
    await page.waitForTimeout(500);

    // Verify success toast or confirmation
    await expect(page.locator('text=/Settings updated successfully|ಸೆಟ್ಟಿಂಗ್ಸ್ ಯಶಸ್ವಿಯಾಗಿ/i')).toBeVisible();

    // 3. Farming Details Tab
    const farmingTab = page.locator('button:has-text("Farming Details"), button:has-text("ಕೃಷಿ ವಿವರಗಳು")').first();
    await farmingTab.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Land Holding|ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ/i')).toBeVisible();

    // 4. Crops & Location Tab
    const cropsTab = page.locator('button:has-text("Crops & Location"), button:has-text("ಬೆಳೆಗಳು & ಸ್ಥಳ")').first();
    await cropsTab.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Mandya|ಮಂಡ್ಯ/i').first()).toBeVisible();
    await expect(page.locator('text=/Sugarcane|Paddy|ಕಬ್ಬು|ಭತ್ತ/i').first()).toBeVisible();

    // 5. Display & Accessibility Tab (Text size scaling & Data Saver)
    const displayTab = page.locator('button:has-text("Display & Accessibility"), button:has-text("ಪ್ರದರ್ಶನ & ಸುಲಭ ಪ್ರವೇಶ")').first();
    await displayTab.click();
    await page.waitForTimeout(300);

    // Select Large text size
    const largeTextBtn = page.locator('button:has-text("Large"), button:has-text("ದೊಡ್ಡದು")').first();
    await largeTextBtn.click();
    await page.waitForTimeout(200);

    // Select Data saver mode
    const dataSaverCheckbox = page.locator('input[type="checkbox"]').first();
    await dataSaverCheckbox.check();

    // Save display preferences
    const saveDisplayBtn = page.locator('button:has-text("Save Changes"), button:has-text("ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ")').first();
    await saveDisplayBtn.click();
    await page.waitForTimeout(500);

    // 6. Test Language Switching
    const kannadaBtn = page.locator('button:has-text("ಕನ್ನಡ (Kannada)")').first();
    await kannadaBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('h1')).toBeVisible();

    const englishBtn = page.locator('button:has-text("English")').first();
    await englishBtn.click();
    await page.waitForTimeout(300);
  });

  test('3. Help Centre, FAQs, Helplines & Support Tickets', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Switch to Help tab
    const helpTab = page.locator('button:has-text("Help Centre"), button:has-text("ಸಹಾಯ ಕೇಂದ್ರ")').first();
    await helpTab.click();
    await page.waitForTimeout(300);

    // 1. Open FAQ & Helplines Modal
    const faqBtn = page.locator('button:has-text("Frequently Asked Questions"), button:has-text("ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು")').first();
    await faqBtn.click();

    const helpModal = page.locator('role=dialog');
    await expect(helpModal).toBeVisible();
    await expect(helpModal).toContainText(/Mandya Agricultural Helplines|ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಕೃಷಿ ಸಹಾಯವಾಣಿಗಳು/i);
    await expect(helpModal).toContainText(/1800-180-1551/i);
    await expect(helpModal).toContainText(/08232-277444/i); // KVK VC Farm

    // Test PWA Install button
    const installBtn = helpModal.locator('button:has-text("Install App"), button:has-text("ಆ್ಯಪ್ ಸೇರಿಸಿ")');
    await expect(installBtn).toBeVisible();

    // Close FAQ Modal
    const closeBtn = helpModal.locator('button[aria-label="Close"]');
    await closeBtn.click();
    await page.waitForTimeout(300);

    // 2. Open Support Ticket Modal & Submit
    const supportBtn = page.locator('button:has-text("Contact Support Team"), button:has-text("ಬೆಂಬಲ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ")').first();
    await supportBtn.click();

    const ticketModal = page.locator('role=dialog');
    await expect(ticketModal).toBeVisible();
    await expect(ticketModal.locator('h2')).toContainText(/Contact Support|ಬೆಂಬಲ ತಂಡವನ್ನು/i);

    // Fill support ticket
    await ticketModal.locator('input[type="text"]').fill('Mandya Organic Certification Assistance');
    await ticketModal.locator('textarea').fill('Need inspection guidelines for organic sugarcane parcel in Shivapura village.');

    // Submit Ticket
    const submitBtn = ticketModal.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(1800);

    // Verify switch to My Tickets tab and ticket listed
    await expect(ticketModal).toContainText(/Mandya Organic Certification Assistance/i);

    // Close Ticket Modal
    await ticketModal.locator('button[aria-label="Close"]').click();
  });

  test('4. Platform Administration - Protected 403, Super Admin Dashboard & Moderation', async ({ page }) => {
    // 1. Regular user access to /admin triggers 403 Forbidden view
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h2')).toContainText(/403 Forbidden|ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ/i);
    await expect(page.locator('text=/Switch to Mandya Krishi Admin/i')).toBeVisible();

    // 2. Switch to Demo Administrator
    const switchAdminBtn = page.locator('button:has-text("Switch to Mandya Krishi Admin")');
    await switchAdminBtn.click();
    await page.waitForTimeout(800);

    // Verify Admin Dashboard loads
    await expect(page.locator('h1')).toContainText(/Platform Administration|ನಿರ್ವಹಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್/i);
    await expect(page.locator('text=/Super Admin|ಮುಖ್ಯ ನಿರ್ವಾಹಕ/i')).toBeVisible();

    // 3. Overview Platform Stats
    await expect(page.locator('text=/Total Users|ಒಟ್ಟು ಬಳಕೆದಾರರು/i').first()).toBeVisible();
    await expect(page.locator('text=/Active Listings|ಸಕ್ರಿಯ ಮಾರಾಟ ಪಟ್ಟಿಗಳು/i').first()).toBeVisible();
    await expect(page.locator('text=/Village Groups|ಗ್ರಾಮ ಸಂಘಗಳು/i').first()).toBeVisible();

    // 4. Users Management Tab & Badge Toggle
    const usersTab = page.locator('button:has-text("Users & Verification"), button:has-text("ಬಳಕೆದಾರರು & ದೃಢೀಕರಣ")').first();
    await usersTab.click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=/Lakshmi Devi/i').first()).toBeVisible();
    const verifiedBadgeBtn = page.locator('button[title="Toggle Verified Badge"]').first();
    await verifiedBadgeBtn.click();
    await page.waitForTimeout(300);

    // 5. Content Moderation Reports Queue & Take Down
    const reportsTab = page.locator('button:has-text("Content Moderation"), button:has-text("ವಿವಾದಿತ ವಿಷಯಗಳ ಪರಿಶೀಲನೆ")').first();
    await reportsTab.click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=/Chemical spray overdose advice query|Harmful chemical advice/i').first()).toBeVisible();

    // Take down reported content
    const takeDownBtn = page.locator('button:has-text("Take Down Content"), button:has-text("ವಿಷಯವನ್ನು ತೆಗೆದುಹಾಕಿ")').first();
    if (await takeDownBtn.isVisible()) {
      await takeDownBtn.click();
      await page.waitForTimeout(400);
      await expect(page.locator('text=/reviewed/i').first()).toBeVisible();
    }

    // 6. Village Groups Moderation Tab
    const groupsTab = page.locator('button:has-text("Village Groups"), button:has-text("ಗ್ರಾಮ ಸಂಘಗಳು")').first();
    await groupsTab.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Active|Inactive/i').first()).toBeVisible();

    // 7. Crop Metadata Tab & Add Crop
    const cropsTab = page.locator('button:has-text("Crop Metadata"), button:has-text("ಬೆಳೆಗಳ ನಿರ್ವಹಣೆ")').first();
    await cropsTab.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/SUGARCANE|PADDY|RAGI/i').first()).toBeVisible();

    // Open Add Crop Dialog
    const addCropBtn = page.locator('button:has-text("Add Crop"), button:has-text("ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ")').first();
    await addCropBtn.click();

    const cropDialog = page.locator('role=dialog');
    await expect(cropDialog).toBeVisible();

    await cropDialog.locator('input[placeholder*="MULBERRY"]').fill('MULBERRY');
    await cropDialog.locator('input[placeholder="e.g. Mulberry"]').fill('Mulberry / Silk Food');
    await cropDialog.locator('input[placeholder*="ಹಿಪ್ಪುನೇರಳೆ"]').fill('ಹಿಪ್ಪುನೇರಳೆ (Mulberry)');

    const submitCropBtn = cropDialog.locator('button[type="submit"]');
    await submitCropBtn.click();
    await page.waitForTimeout(500);

    // 8. Moderation Audit Logs Tab
    const auditTab = page.locator('button:has-text("Audit Logs"), button:has-text("ಆಡಿಟ್ ದಾಖಲೆಗಳು")').first();
    await auditTab.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=/Mandya Krishi Admin/i').first()).toBeVisible();
  });

});
