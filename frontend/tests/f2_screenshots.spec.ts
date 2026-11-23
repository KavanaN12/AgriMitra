import { test } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('F2 Crop Advisory Visual Documentation', () => {
  test('capture F2 desktop screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/advisory');
    await page.waitForLoadState('networkidle');
    await page.locator('text=/°C/').first().waitFor({ state: 'visible', timeout: 10000 });

    // 1. Advisory & Weather Dashboard Desktop
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_advisory_dashboard_desktop.png'), fullPage: true });

    // 2. Weather 7-Day Forecast Modal Desktop
    const forecastBtn = page.getByRole('button', { name: /7-Day Forecast|೭ ದಿನಗಳ ಮುನ್ಸೂಚನೆ/i });
    await forecastBtn.waitFor({ state: 'visible' });
    await forecastBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_weather_forecast_modal_desktop.png') });
    await page.getByRole('button', { name: /Close dialog/i }).click();
    await page.waitForTimeout(300);

    // 3. My Crops Tab Desktop
    const myCropsTab = page.getByRole('button', { name: /My Crops|ನನ್ನ ಬೆಳೆಗಳು/i });
    await myCropsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_my_crops_desktop.png'), fullPage: true });

    // 4. Crop Library Tab Desktop
    const libraryTab = page.getByRole('button', { name: /Crop Library|ಬೆಳೆ ಮಾಹಿತಿ ಕೋಶ/i });
    await libraryTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_crop_library_desktop.png'), fullPage: true });

    // 5. Crop Detail Modal Desktop
    const guideBtn = page.getByRole('button', { name: /Growth Guide|ಸಂಪೂರ್ಣ ಮಾಹಿತಿ/i }).first();
    if (await guideBtn.isVisible()) {
      await guideBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_crop_growth_guide_desktop.png') });
      const closeBtn = page.locator('role=dialog').getByRole('button', { name: /Close|ಮುಚ್ಚಿ/i }).last();
      await closeBtn.click();
      await page.waitForTimeout(300);
    }

    // 6. AI Disease Doctor Tab Desktop
    const diseaseTab = page.getByRole('button', { name: /AI Disease Doctor|ಎಐ ರೋಗ ನಿದಾನ ವೈದ್ಯ/i });
    await diseaseTab.click();
    await page.waitForTimeout(500);

    // Click preset sample to show full diagnosis UI
    const sampleBtn = page.getByRole('button', { name: /Sugarcane Red Rot|ಕಬ್ಬಿನ ಕೆಂಪು ಕೊಳೆ/i });
    if (await sampleBtn.isVisible()) {
      await sampleBtn.click();
      await page.waitForTimeout(200);
      const diagnoseBtn = page.getByRole('button', { name: /Analyze Crop Symptoms|ರೋಗ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಿಸಿ/i });
      await diagnoseBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_ai_disease_doctor_desktop.png'), fullPage: true });
  });

  test('capture F2 mobile screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/advisory');
    await page.waitForLoadState('networkidle');
    await page.locator('text=/°C/').first().waitFor({ state: 'visible', timeout: 10000 });

    // 1. Advisory & Weather Dashboard Mobile
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_advisory_dashboard_mobile.png'), fullPage: true });

    // 2. My Crops Mobile
    const myCropsTab = page.getByRole('button', { name: /My Crops|ನನ್ನ ಬೆಳೆಗಳು/i });
    await myCropsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_my_crops_mobile.png'), fullPage: true });

    // 3. AI Disease Doctor Mobile
    const diseaseTab = page.getByRole('button', { name: /AI Disease Doctor|ಎಐ ರೋಗ ನಿದಾನ ವೈದ್ಯ/i });
    await diseaseTab.click();
    await page.waitForTimeout(500);
    const sampleBtn = page.getByRole('button', { name: /Sugarcane Red Rot|ಕಬ್ಬಿನ ಕೆಂಪು ಕೊಳೆ/i });
    if (await sampleBtn.isVisible()) {
      await sampleBtn.click();
      await page.waitForTimeout(200);
      const diagnoseBtn = page.getByRole('button', { name: /Analyze Crop Symptoms|ರೋಗ ಲಕ್ಷಣ ವಿಶ್ಲೇಷಿಸಿ/i });
      await diagnoseBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'f2_ai_disease_doctor_mobile.png'), fullPage: true });
  });
});
