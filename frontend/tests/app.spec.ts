import { test, expect } from '@playwright/test';

test.describe('AgriMitra Foundation Smoke Tests', () => {
  test('should load application shell and display Mandya pilot branding', async ({ page }) => {
    await page.goto('/');

    // Check title & branding
    await expect(page).toHaveTitle(/AgriMitra/);
    await expect(page.locator('header')).toContainText('AgriMitra');
    await expect(page.locator('header')).toContainText('ಕೃಷಿಮಿತ್ರ');

    // Check data source indicator
    await expect(page.locator('body')).toContainText(/Demo Mode|Live API/i);
  });

  test('should toggle between Kannada and English languages', async ({ page }) => {
    await page.goto('/');

    // Switch to English
    const enBtn = page.getByRole('button', { name: /english/i }).first();
    await enBtn.click();
    await expect(page.locator('header')).toContainText(/Home|Advisory|ಮುಖಪುಟ/);

    // Switch back to Kannada
    const knBtn = page.getByRole('button', { name: /kannada|ಕನ್ನಡ/i }).first();
    await knBtn.click();
    await expect(page.locator('header')).toContainText(/ಮುಖಪುಟ|ಬೆಳೆ ಸಲಹೆ/);
  });

  test('should navigate to Smart Crop Advisory page and show filters', async ({ page }) => {
    await page.goto('/advisory');
    await expect(page.locator('h1')).toContainText(/ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸಲಹೆ|Smart Crop Advisory/);
    await expect(page.locator('body')).toContainText(/ಕಬ್ಬು|Sugarcane/);
  });

  test('should navigate to Farmer Community page and show taluk groups', async ({ page }) => {
    await page.goto('/community');
    await expect(page.locator('h1')).toContainText(/ರೈತರ ಸಂಘ|Farmer Community/);
    await expect(page.locator('body')).toContainText(/Maddur|Mandya|ಮದ್ದೂರು/);
  });

  test('should navigate to Farmer-to-Buyer Marketplace', async ({ page }) => {
    await page.goto('/market');
    await expect(page.locator('h1')).toContainText(/ನೇರ ಸಂಪರ್ಕ|Farmer-to-Buyer/);
    await expect(page.locator('body')).toContainText(/₹/);
  });

  test('should load profile page with registered farmer details', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText(/ಪ್ರೊಫೈಲ್|Profile/);
    await expect(page.locator('body')).toContainText(/Ramesh Gowda/);
    await expect(page.locator('body')).toContainText(/Mandya|ಮಂಡ್ಯ/);
  });
});
