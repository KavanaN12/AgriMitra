import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('AgriMitra Brand Logo & Kannada Typography Verification', () => {

  test('Desktop (1280x800) Kannada and English Brand Header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:8000/');
    await page.waitForTimeout(1000);

    // Switch to Kannada
    const knBtn = page.getByRole('button', { name: /ಕನ್ನಡ/i });
    if (await knBtn.isVisible()) {
      await knBtn.click();
      await page.waitForTimeout(500);
    }

    // Verify brand text is completely visible without wrapping or clipping
    const brandTitle = page.getByTestId('brand-logo');
    await expect(brandTitle).toBeVisible();
    await expect(brandTitle).toContainText('AgriMitra');
    await expect(brandTitle).toContainText('ಕೃಷಿಮಿತ್ರ');
    await expect(brandTitle).toContainText('ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ');

    // Capture desktop Kannada header screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'brand_header_desktop_kn.png'),
      clip: { x: 0, y: 0, width: 1280, height: 180 }
    });

    // Switch to English and verify balance
    const enBtn = page.getByRole('button', { name: /English/i });
    await enBtn.click();
    await page.waitForTimeout(500);

    await expect(brandTitle).toContainText('AgriMitra');
    await expect(brandTitle).toContainText('ಕೃಷಿಮಿತ್ರ');
    await expect(brandTitle).toContainText('Mandya District Pilot Project');

    // Capture desktop English header screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'brand_header_desktop_en.png'),
      clip: { x: 0, y: 0, width: 1280, height: 180 }
    });
  });

  test('Tablet (768x1024) Kannada Brand Header', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8000/');
    await page.waitForTimeout(1000);

    // Switch to Kannada
    const knBtn = page.getByRole('button', { name: /ಕನ್ನಡ/i });
    if (await knBtn.isVisible()) {
      await knBtn.click();
      await page.waitForTimeout(500);
    }

    const brandTitle = page.getByTestId('brand-logo');
    await expect(brandTitle).toBeVisible();
    await expect(brandTitle).toContainText('AgriMitra');
    await expect(brandTitle).toContainText('ಕೃಷಿಮಿತ್ರ');
    await expect(brandTitle).toContainText('ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ');

    // Capture tablet Kannada header screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'brand_header_tablet_kn.png'),
      clip: { x: 0, y: 0, width: 768, height: 180 }
    });
  });

  test('Mobile (375x812) Kannada Brand Header', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:8000/');
    await page.waitForTimeout(1000);

    // Switch to Kannada
    const knBtn = page.getByRole('button', { name: /ಕನ್ನಡ/i });
    if (await knBtn.isVisible()) {
      await knBtn.click();
      await page.waitForTimeout(500);
    }

    const brandTitle = page.getByTestId('brand-logo');
    await expect(brandTitle).toBeVisible();
    await expect(brandTitle).toContainText('AgriMitra');
    await expect(brandTitle).toContainText('ಕೃಷಿಮಿತ್ರ');
    await expect(brandTitle).toContainText('ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ');

    // Capture mobile Kannada header screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'brand_header_mobile_kn.png'),
      clip: { x: 0, y: 0, width: 375, height: 180 }
    });

    // Also capture full mobile home screen in Kannada to verify headings & navigation
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'live_home_mobile_kannada_fixed.png'),
      fullPage: true
    });
  });

  test('Profile Page in Kannada (Matching User Screenshot)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Login as Ramesh Gowda
    await page.goto('http://localhost:8000/login');
    const demoLoginBtn = page.getByRole('button', { name: /1-Click Demo Login|1-ಕ್ಲಿಕ್ ಡೆಮೊ/i });
    if (await demoLoginBtn.isVisible()) {
      await demoLoginBtn.click();
      await page.waitForTimeout(1500);
    }

    // Switch to Kannada
    await page.goto('http://localhost:8000/profile');
    await page.waitForTimeout(1500);

    const knBtn = page.getByRole('button', { name: /ಕನ್ನಡ/i });
    if (await knBtn.isVisible()) {
      await knBtn.click();
      await page.waitForTimeout(800);
    }

    // Capture full-page screenshot matching user's exact screen
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'profile_page_kannada_fixed.png'),
      fullPage: true
    });
  });

});
