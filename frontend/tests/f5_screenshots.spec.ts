import { test } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('F5 Shared & Admin Visual Verification', () => {
  test('capture F5 desktop screens', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1280, height: 850 });

    // 1. Notification Center Desktop
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const bellBtn = page.locator('button[aria-label="View notifications"]');
    await bellBtn.waitFor({ state: 'visible' });
    await bellBtn.click();
    const notifModal = page.locator('role=dialog');
    await notifModal.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_notification_center_desktop.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 2. User Profile & Settings Desktop (Accessibility Tab)
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const displayTab = page.locator('button:has-text("Display & Accessibility"), button:has-text("ಪ್ರದರ್ಶನ & ಸುಲಭ ಪ್ರವೇಶ")').first();
    await displayTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_user_settings_desktop.png'), fullPage: true });

    // 3. Help Center Modal Desktop
    const helpTab = page.locator('button:has-text("Help Centre"), button:has-text("ಸಹಾಯ ಕೇಂದ್ರ")').first();
    await helpTab.click();
    await page.waitForTimeout(300);
    const faqBtn = page.locator('button:has-text("Frequently Asked Questions"), button:has-text("ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು")').first();
    await faqBtn.click();
    const helpModal = page.locator('role=dialog');
    await helpModal.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_help_center_desktop.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 4. Admin Overview Desktop
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    const switchAdminBtn = page.locator('button:has-text("Switch to Mandya Krishi Admin")');
    await switchAdminBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_admin_overview_desktop.png'), fullPage: true });

    // 5. Admin Content Moderation Desktop
    const reportsTab = page.locator('button:has-text("Content Moderation"), button:has-text("ವಿವಾದಿತ ವಿಷಯಗಳ ಪರಿಶೀಲನೆ")').first();
    await reportsTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_admin_moderation_desktop.png'), fullPage: true });
  });

  test('capture F5 mobile screens', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 375, height: 812 });

    // 1. Notification Center Mobile
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const bellBtn = page.locator('button[aria-label="View notifications"]');
    await bellBtn.waitFor({ state: 'visible' });
    await bellBtn.click();
    const notifModal = page.locator('role=dialog');
    await notifModal.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_notification_center_mobile.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 2. User Settings Mobile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const displayTab = page.locator('button:has-text("Display & Accessibility"), button:has-text("ಪ್ರದರ್ಶನ & ಸುಲಭ ಪ್ರವೇಶ")').first();
    await displayTab.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_user_settings_mobile.png'), fullPage: true });

    // 3. Help Center Mobile
    const helpTab = page.locator('button:has-text("Help Centre"), button:has-text("ಸಹಾಯ ಕೇಂದ್ರ")').first();
    await helpTab.click();
    await page.waitForTimeout(300);
    const faqBtn = page.locator('button:has-text("Frequently Asked Questions"), button:has-text("ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು")').first();
    await faqBtn.click();
    const helpModal = page.locator('role=dialog');
    await helpModal.waitFor({ state: 'visible' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_help_center_mobile.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 4. Admin Overview Mobile
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    const switchAdminMobileBtn = page.locator('button:has-text("Switch to Mandya Krishi Admin")');
    await switchAdminMobileBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f5_admin_overview_mobile.png'), fullPage: true });
  });
});
