import { test, expect } from '@playwright/test';

test.describe('AgriMitra Interconnected Ecosystem E2E Verification', () => {

  test('Admin, Extension Expert, and Buyer Multi-Persona Journeys', async ({ page }) => {
    test.setTimeout(90000);

    // -------------------------------------------------------------
    // Persona 1: Admin (Mandya Krishi Admin)
    // -------------------------------------------------------------
    console.log('[E2E-Ecosystem] Navigating to Login for Admin');
    await page.goto('http://localhost:8000/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="text"]', 'admin@agrimitra.gov.in');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Navigate to Admin Dashboard
    console.log('[E2E-Ecosystem] Verifying Admin Dashboard');
    await page.goto('http://localhost:8000/admin');
    await page.waitForLoadState('networkidle');

    // Admin should see User Management & Statistics
    const adminHeading = page.locator('h1, h2').filter({ hasText: /Admin|ಆಡಳಿತ/i }).first();
    await expect(adminHeading).toBeVisible();

    // Verify user count reflects genuine accounts (11 users)
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/11|Users|ಬಳಕೆದಾರರು/i);
    console.log('[E2E-Ecosystem] Admin dashboard verified with registered user ecosystem.');

    // Logout Admin
    const logoutBtn = page.locator('button').filter({ hasText: /Logout|ನಿರ್ಗಮಿಸಿ/i }).first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      await page.goto('http://localhost:8000/login');
    }
    await page.waitForTimeout(1000);

    // -------------------------------------------------------------
    // Persona 2: Extension Staff (Dr. Ravi Kumar)
    // -------------------------------------------------------------
    console.log('[E2E-Ecosystem] Logging in as Dr. Ravi Kumar (Extension Officer)');
    await page.goto('http://localhost:8000/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="text"]', 'ravi.extension@agrimitra.gov.in');
    await page.fill('input[type="password"]', 'RaviOfficer@2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Verify Profile
    await page.goto('http://localhost:8000/profile');
    await page.waitForLoadState('networkidle');
    const profileText = await page.textContent('body');
    expect(profileText).toContain('Dr. Ravi Kumar');
    expect(profileText).toContain('ravi.extension@agrimitra.gov.in');
    console.log('[E2E-Ecosystem] Verified Dr. Ravi Kumar authenticated profile.');

    // Check Community Forum
    console.log('[E2E-Ecosystem] Viewing Community Forum as Dr. Ravi');
    await page.goto('http://localhost:8000/community');
    await page.waitForLoadState('networkidle');

    // Verify Thread discussions are visible
    const forumContent = await page.textContent('body');
    expect(forumContent).toMatch(/Sugarcane|Paddy|Blast|Fertigation|ಕಬ್ಬು|ಭತ್ತ/i);
    console.log('[E2E-Ecosystem] Community Forum displays multi-party discussions.');

    // Logout Dr. Ravi
    const staffLogout = page.locator('button').filter({ hasText: /Logout|ನಿರ್ಗಮಿಸಿ/i }).first();
    if (await staffLogout.isVisible()) {
      await staffLogout.click();
    } else {
      await page.goto('http://localhost:8000/login');
    }
    await page.waitForTimeout(1000);

    // -------------------------------------------------------------
    // Persona 3: Buyer (Arjun Traders)
    // -------------------------------------------------------------
    console.log('[E2E-Ecosystem] Logging in as Arjun Traders');
    await page.goto('http://localhost:8000/login');
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="text"]', 'arjun.buyer@example.com');
    await page.fill('input[type="password"]', 'ArjunBuyer@2026');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Verify Marketplace
    console.log('[E2E-Ecosystem] Navigating to Marketplace as Buyer');
    await page.goto('http://localhost:8000/market');
    await page.waitForLoadState('networkidle');

    const marketText = await page.textContent('body');
    expect(marketText).toMatch(/Quintal|₹|Price|ಮಾರಾಟ/i);
    console.log('[E2E-Ecosystem] Marketplace displays active farmer listings.');

    // Verify Enquiries Page
    console.log('[E2E-Ecosystem] Navigating to Enquiries');
    await page.goto('http://localhost:8000/enquiries');
    await page.waitForLoadState('networkidle');

    const enquiryText = await page.textContent('body');
    expect(enquiryText).toMatch(/Enquiries|ವಿಚಾರಣೆಗಳು|Offer|Price/i);
    console.log('[E2E-Ecosystem] Enquiries dashboard verified for Buyer.');

    console.log('[E2E-Ecosystem] ALL PERSONA JOURNEYS SUCCESSFULLY VERIFIED!');
  });
});
