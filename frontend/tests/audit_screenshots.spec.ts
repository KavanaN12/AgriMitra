import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots');
const ARTIFACT_SCREENSHOT_DIR = 'C:\\Users\\Kavana\\.gemini\\antigravity\\brain\\c681cc85-4a07-4bab-8f6f-c622293bb831\\screenshots';

function copyToArtifacts(filename: string) {
  const src = path.join(SCREENSHOT_DIR, filename);
  const dest = path.join(ARTIFACT_SCREENSHOT_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

test.describe('AgriMitra Visual Audit & Screenshots', () => {
  test('Capture Desktop Screens & Test Interactions', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 850 });

    // 1. Home Screen (Desktop, Kannada)
    await page.goto('/');
    await page.waitForSelector('header');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home_desktop.png'), fullPage: true });
    copyToArtifacts('home_desktop.png');

    // 2. English Toggle on Desktop
    const enBtn = page.getByRole('button', { name: /english/i }).first();
    await enBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home_english_desktop.png'), fullPage: true });
    copyToArtifacts('home_english_desktop.png');

    // Switch back to Kannada
    const knBtn = page.getByRole('button', { name: /kannada|ಕನ್ನಡ/i }).first();
    await knBtn.click();
    await page.waitForTimeout(800);

    // 3. Advisory Screen (Desktop)
    await page.goto('/advisory');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'advisory_desktop.png'), fullPage: true });
    copyToArtifacts('advisory_desktop.png');

    // Click first advisory card to open detail modal
    const firstAdvCard = page.locator('.cursor-pointer').first();
    await firstAdvCard.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'advisory_modal_desktop.png') });
    copyToArtifacts('advisory_modal_desktop.png');
    // Close modal
    await page.getByRole('button', { name: /ಮುಚ್ಚಿ|close/i }).first().click();
    await page.waitForTimeout(400);

    // 4. Community Screen (Desktop)
    await page.goto('/community');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'community_desktop.png'), fullPage: true });
    copyToArtifacts('community_desktop.png');

    // Open "Start Discussion" modal
    await page.getByRole('button', { name: /ಹೊಸ ಚರ್ಚೆ|new post|start discussion/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'community_modal_desktop.png') });
    copyToArtifacts('community_modal_desktop.png');

    // Fill and submit new post form to verify MSW mutation
    await page.locator('input[placeholder*="ಉದಾಹರಣೆಗೆ"]').fill('ಮದ್ದೂರು ಕೆರೆ ತುಂಬಿಸುವ ಯೋಜನೆ ಬಗ್ಗೆ ಮಾಹಿತಿ ಬೇಕು');
    await page.locator('textarea[placeholder*="ವಿವರವಾದ"]').fill('ಮದ್ದೂರು ತಾಲೂಕಿನ ಕೆರೆಗಳಿಗೆ ನಾಲೆಯಿಂದ ನೀರು ಹರಿಸುವ ದಿನಾಂಕ ತಿಳಿಸಿ.');
    await page.getByRole('button', { name: /ಸಲ್ಲಿಸಿ|submit/i }).click();
    await page.waitForTimeout(1200);
    await expect(page.locator('body')).toContainText(/ಯಶಸ್ವಿಯಾಗಿ|ಮದ್ದೂರು ಕೆರೆ/);

    // 5. Marketplace Screen (Desktop)
    await page.goto('/market');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'market_desktop.png'), fullPage: true });
    copyToArtifacts('market_desktop.png');

    // Open "List Produce" modal
    await page.getByRole('button', { name: /ಉತ್ಪನ್ನ ಮಾರಾಟಕ್ಕೆ ಇಡಿ|new listing|list your produce/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'market_modal_desktop.png') });
    copyToArtifacts('market_modal_desktop.png');
    await page.getByRole('button', { name: /ರದ್ದುಮಾಡಿ|cancel/i }).click();
    await page.waitForTimeout(400);

    // Open "Send Buyer Enquiry" modal on first listing
    await page.getByRole('button', { name: /ಖರೀದಿ ವಿಚಾರಣೆ ಕಳುಹಿಸಿ|enquire now/i }).first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'market_enquiry_modal_desktop.png') });
    copyToArtifacts('market_enquiry_modal_desktop.png');
    await page.getByRole('button', { name: /ರದ್ದುಮಾಡಿ|cancel/i }).click();
    await page.waitForTimeout(400);

    // 6. Profile Screen (Desktop)
    await page.goto('/profile');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'profile_desktop.png'), fullPage: true });
    copyToArtifacts('profile_desktop.png');
  });

  test('Capture Mobile Screens (iPhone 14 / Small Smartphone Layout)', async ({ page }) => {
    // Mobile Viewport: 390 x 844
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Home Screen (Mobile)
    await page.goto('/');
    await page.waitForSelector('header');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home_mobile.png'), fullPage: true });
    copyToArtifacts('home_mobile.png');

    // 2. Advisory Screen (Mobile)
    await page.goto('/advisory');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'advisory_mobile.png'), fullPage: true });
    copyToArtifacts('advisory_mobile.png');

    // 3. Community Screen (Mobile)
    await page.goto('/community');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'community_mobile.png'), fullPage: true });
    copyToArtifacts('community_mobile.png');

    // 4. Marketplace Screen (Mobile)
    await page.goto('/market');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'market_mobile.png'), fullPage: true });
    copyToArtifacts('market_mobile.png');

    // 5. Profile Screen (Mobile)
    await page.goto('/profile');
    await page.waitForSelector('h1');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'profile_mobile.png'), fullPage: true });
    copyToArtifacts('profile_mobile.png');
  });
});
