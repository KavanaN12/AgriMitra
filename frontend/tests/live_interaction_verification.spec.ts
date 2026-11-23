import { test, expect } from '@playwright/test';

test('Live Frontend Interaction & Cross-User Visibility Test', async ({ page }) => {
  test.setTimeout(45000);

  // 1. Login as Farmer Kavana N
  console.log('[Interaction Test] Logging in as Kavana N');
  await page.goto('http://localhost:8000/login');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();

  await page.fill('input[type="text"]', 'kavana.farmer@example.com');
  await page.fill('input[type="password"]', 'KavanaFarmer@2026');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // 2. Navigate to Community Forum
  console.log('[Interaction Test] Navigating to Community Forum');
  await page.goto('http://localhost:8000/community');
  await page.waitForLoadState('networkidle');

  // Open the Subsurface Drip Fertigation post modal
  const postCard = page.locator('.cursor-pointer').filter({ hasText: /Subsurface Drip Fertigation/i }).first();
  await postCard.click();
  await page.waitForTimeout(1000);

  // Post a new comment through the frontend form
  const textarea = page.locator('textarea').first();
  await expect(textarea).toBeVisible();

  const testComment = `Field Update: Soil moisture steady at 28% after the UAS fertigation cycle. Test timestamp: ${new Date().toISOString()}`;
  await textarea.fill(testComment);

  const submitCommentBtn = page.locator('button[type="submit"]').filter({ hasText: /Send|ಸಲ್ಲಿಸು|Post|ಪ್ರತಿಕ್ರಿಯಿಸಿ/i }).first();
  if (await submitCommentBtn.isVisible()) {
    await submitCommentBtn.click();
  } else {
    // If submit button doesn't have text, look for button near textarea
    await page.locator('form button[type="submit"]').click();
  }
  await page.waitForTimeout(2500);

  // Verify comment appears in the modal
  const modalText = await page.textContent('body');
  expect(modalText).toContain('Field Update: Soil moisture steady');
  console.log('    ✓ Submitted new live comment as Kavana N through UI modal');

  // 3. Logout Kavana
  await page.goto('http://localhost:8000/login');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();

  // 4. Login as Dr. Ravi Kumar (Extension Officer)
  console.log('[Interaction Test] Logging in as Dr. Ravi Kumar');
  await page.fill('input[type="text"]', 'ravi.extension@agrimitra.gov.in');
  await page.fill('input[type="password"]', 'RaviOfficer@2026');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  // 5. Navigate to Community Forum as Dr. Ravi and open the same post
  console.log('[Interaction Test] Verifying cross-account visibility for Dr. Ravi');
  await page.goto('http://localhost:8000/community');
  await page.waitForLoadState('networkidle');

  const postCardRavi = page.locator('.cursor-pointer').filter({ hasText: /Subsurface Drip Fertigation/i }).first();
  await postCardRavi.click();
  await page.waitForTimeout(1000);

  const raviModalText = await page.textContent('body');
  expect(raviModalText).toContain('Field Update: Soil moisture steady');
  console.log('    ✓ Dr. Ravi verified Kavana N live comment in real time through the frontend!');
});
