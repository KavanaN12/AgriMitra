import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('AgriMitra Comprehensive Live QA & Visual Verification', () => {

  test('Desktop Audit & Screenshots across all 9 pages', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Welcome & Language Switching
    await page.goto('http://localhost:8000/welcome');
    await expect(page).toHaveTitle(/AgriMitra/i);
    await expect(page.locator('h1')).toBeVisible();

    // Toggle English
    const engBtn = page.getByRole('button', { name: 'English', exact: true });
    if (await engBtn.isVisible()) {
      await engBtn.click();
      await page.waitForTimeout(500);
    }

    // 2. Login as Demo Farmer (Ramesh Gowda)
    await page.goto('http://localhost:8000/login');
    const demoLoginBtn = page.getByRole('button', { name: /1-Click Demo Login|1-ಕ್ಲಿಕ್ ಡೆಮೊ/i });
    await expect(demoLoginBtn).toBeVisible();
    await demoLoginBtn.click();
    await page.waitForTimeout(2000);

    // 3. Home Dashboard (Page 1)
    await page.goto('http://localhost:8000/');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Mandya|ಮಂಡ್ಯ|AgriMitra|ಕೃಷಿ/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_home_desktop.png'), fullPage: true });

    // 4. Crop Advisory (Page 2)
    await page.goto('http://localhost:8000/advisory');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Advisory|ಸಲಹೆ|Weather|ಹವಾಮಾನ|Crops|ಬೆಳೆ/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_advisory_desktop.png'), fullPage: true });

    // 5. Community Forum (Page 3)
    await page.goto('http://localhost:8000/community');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Community|ಸಮುದಾಯ|Forum|ಚರ್ಚೆ/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_community_desktop.png'), fullPage: true });

    // 6. Village Groups (Page 4)
    await page.goto('http://localhost:8000/groups');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Groups|ಸಂಘ|Maddur|Mandya|Pandavapura/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_groups_desktop.png'), fullPage: true });

    // 7. Produce Marketplace (Page 5)
    await page.goto('http://localhost:8000/market');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Marketplace|ಮಾರುಕಟ್ಟೆ|Sugarcane|Coconut|Paddy/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_marketplace_desktop.png'), fullPage: true });

    // 8. Enquiries (Page 6)
    await page.goto('http://localhost:8000/enquiries');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Enquiries|ವಿಚಾರಣೆ|Market|ಬೆಳೆ/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_enquiries_desktop.png'), fullPage: true });

    // 9. Profile & Settings (Page 7)
    await page.goto('http://localhost:8000/settings');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Settings|ಸೆಟ್ಟಿಂಗ್ಸ್|Profile|ವಿವರ/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_profile_desktop.png'), fullPage: true });

    // 10. Notifications (Page 8)
    await page.goto('http://localhost:8000/notifications');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_notifications_desktop.png'), fullPage: true });

    // 11. Admin Dashboard (Page 9)
    // Sign out or switch to Admin User
    await page.evaluate(() => {
      // Simulate admin session token in localStorage
      localStorage.setItem('agrimitra_token', 'agrimitra_token_4_1700000000');
      localStorage.setItem('agrimitra_user', JSON.stringify({
        id: 4,
        phone_number: '9845000000',
        full_name: 'Mandya Krishi Admin',
        role: 'admin',
        roles: 'admin',
        active_role: 'admin',
        is_admin: true,
        is_onboarded: true
      }));
    });
    await page.goto('http://localhost:8000/admin');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Admin|ಆಡಳಿತ|Overview|Users|Moderation/i);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_admin_desktop.png'), fullPage: true });

    // 12. 404 Route Verification
    await page.goto('http://localhost:8000/invalid-page-test-404');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText(/404/i);
  });

  test('Mobile Viewport Audit & Screenshots (375x812)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Log in
    await page.goto('http://localhost:8000/login');
    const demoLoginBtn = page.getByRole('button', { name: /1-Click Demo Login|1-ಕ್ಲಿಕ್ ಡೆಮೊ/i });
    if (await demoLoginBtn.isVisible()) {
      await demoLoginBtn.click();
      await page.waitForTimeout(2000);
    }

    // 1. Mobile Home Dashboard
    await page.goto('http://localhost:8000/');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_home_mobile.png'), fullPage: true });

    // 2. Mobile Advisory
    await page.goto('http://localhost:8000/advisory');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_advisory_mobile.png'), fullPage: true });

    // 3. Mobile Community
    await page.goto('http://localhost:8000/community');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_community_mobile.png'), fullPage: true });

    // 4. Mobile Groups
    await page.goto('http://localhost:8000/groups');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_groups_mobile.png'), fullPage: true });

    // 5. Mobile Marketplace
    await page.goto('http://localhost:8000/market');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_marketplace_mobile.png'), fullPage: true });

    // 6. Mobile Enquiries
    await page.goto('http://localhost:8000/enquiries');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_enquiries_mobile.png'), fullPage: true });

    // 7. Mobile Profile & Settings
    await page.goto('http://localhost:8000/settings');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_profile_mobile.png'), fullPage: true });

    // 8. Mobile Notifications
    await page.goto('http://localhost:8000/notifications');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_notifications_mobile.png'), fullPage: true });

    // 9. Mobile Admin
    await page.evaluate(() => {
      localStorage.setItem('agrimitra_token', 'agrimitra_token_4_1700000000');
      localStorage.setItem('agrimitra_user', JSON.stringify({
        id: 4,
        phone_number: '9845000000',
        full_name: 'Mandya Krishi Admin',
        role: 'admin',
        roles: 'admin',
        active_role: 'admin',
        is_admin: true,
        is_onboarded: true
      }));
    });
    await page.goto('http://localhost:8000/admin');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'live_admin_mobile.png'), fullPage: true });
  });

});
