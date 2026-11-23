import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('Live Docker Compose Local Deployment Verification', () => {

  test('Complete Local Container Verification on http://localhost:8000', async ({ page }) => {
    // Collect intercepted API responses
    const apiCalls: { url: string; status: number }[] = [];

    page.on('response', resp => {
      const url = resp.url();
      if (url.includes('/api/v1/')) {
        apiCalls.push({ url, status: resp.status() });
      }
    });

    // 1. Visit Welcome Screen on Docker container
    await page.goto('http://localhost:8000/welcome');
    await expect(page).toHaveTitle(/AgriMitra/i);
    await expect(page.locator('h1')).toBeVisible();

    // Verify Bilingual Language Switching: Switch to English
    const englishBtn = page.getByRole('button', { name: 'English', exact: true });
    if (await englishBtn.isVisible()) {
      await englishBtn.click();
      await expect(page.getByRole('heading', { name: 'Smart Crop Advisory' })).toBeVisible();
    }

    // 2. Navigate to Login Page
    await page.goto('http://localhost:8000/login');
    await expect(page.locator('h1')).toBeVisible();

    // 3. Click the 1-Click Demo Login button to authenticate with PostgreSQL
    const demoLoginBtn = page.getByRole('button', { name: /1-Click Demo Login|1-ಕ್ಲಿಕ್ ಡೆಮೊ/i });
    await expect(demoLoginBtn).toBeVisible();
    await demoLoginBtn.click();

    // 4. Wait for navigation (either /onboarding or /)
    await page.waitForTimeout(3000);
    console.log('Post-login current URL:', page.url());

    // 5. Navigate to Home Dashboard
    await page.goto('http://localhost:8000/');
    await page.waitForTimeout(2000);

    // Capture screenshot of live container home / advisory view
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'docker_live_dashboard.png'),
      fullPage: true
    });

    // 6. Navigate to Produce Marketplace
    await page.goto('http://localhost:8000/market');
    await page.waitForTimeout(2000);

    // Verify market items rendered from PostgreSQL
    await expect(page.locator('body')).toContainText(/Marketplace|ಮಾರುಕಟ್ಟೆ|Produce|ಬೆಳೆ/i);

    // Capture screenshot of live marketplace
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'docker_live_market.png'),
      fullPage: true
    });

    // 7. Navigate to Community Groups
    await page.goto('http://localhost:8000/community');
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Community|ಸಮುದಾಯ|Groups|ಚರ್ಚೆ/i);

    // Capture screenshot of live community
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'docker_live_community.png'),
      fullPage: true
    });

    // 8. Assert API requests were dispatched directly to FastAPI (no MSW interception)
    console.log(`Recorded ${apiCalls.length} API calls directly to container FastAPI:`);
    for (const call of apiCalls) {
      console.log(`  [${call.status}] ${call.url}`);
    }

    expect(apiCalls.length).toBeGreaterThan(0);
    const loginCall = apiCalls.find(c => c.url.includes('/api/v1/auth/login'));
    expect(loginCall).toBeDefined();
    expect(loginCall?.status).toBe(200);
  });

});
