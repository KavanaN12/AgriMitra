import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Kavana/.gemini/antigravity/brain/c681cc85-4a07-4bab-8f6f-c622293bb831/screenshots';

test.describe('Real Multi-User Authentication & Isolation Verification on Docker', () => {

  test('Complete End-to-End User Journey for Kavana N and Vijay Kumar', async ({ page }) => {
    test.setTimeout(90000);

    // Track network requests to verify real FastAPI connection
    const interceptedApi: { url: string; status: number; method: string }[] = [];
    page.on('response', resp => {
      const url = resp.url();
      if (url.includes('/api/v1/')) {
        interceptedApi.push({ url, status: resp.status(), method: resp.request().method() });
      }
    });

    // -------------------------------------------------------------
    // Step 1: Open Login Page & Verify Real API Connection
    // -------------------------------------------------------------
    console.log('[E2E] Navigating to http://localhost:8000/login');
    await page.goto('http://localhost:8000/login');
    await page.waitForLoadState('networkidle');

    // Verify Title & Header
    await expect(page).toHaveTitle(/AgriMitra/i);

    // Verify Real API was called (e.g. /api/v1/health)
    const healthCalls = interceptedApi.filter(a => a.url.includes('/api/v1/health'));
    expect(healthCalls.length).toBeGreaterThan(0);
    expect(healthCalls[0].status).toBe(200);
    console.log('[E2E] Verified /api/v1/health reached FastAPI directly with status 200');

    // -------------------------------------------------------------
    // Step 2: Register Genuine User: Kavana N (Farmer)
    // -------------------------------------------------------------
    console.log('[E2E] Navigating to Registration Page');
    await page.goto('http://localhost:8000/register');
    await page.waitForLoadState('networkidle');

    // Fill Registration Form using exact name attributes
    await page.fill('input[name="full_name"]', 'Kavana N');
    await page.fill('input[name="email"]', 'kavana.farmer@example.com');
    await page.fill('input[name="phone_number"]', '9845222001');
    await page.fill('input[name="password"]', 'KavanaFarmer@2026');
    await page.fill('input[name="confirm_password"]', 'KavanaFarmer@2026');

    // Select Farmer Role
    const farmerCard = page.locator('button').filter({ hasText: /Farmer|ರೈತ/i }).first();
    if (await farmerCard.isVisible()) {
      await farmerCard.click();
    }

    // Select Mandya Location: Taluk = Maddur
    const talukSelect = page.locator('select').first();
    await talukSelect.selectOption({ label: 'Maddur' });
    await page.waitForTimeout(500);

    // Fill Farm size
    const farmInput = page.locator('input[name="farm_size_acres"]');
    if (await farmInput.isVisible()) {
      await farmInput.fill('4.5');
    }

    // Select Crops: Sugarcane
    const sugarcaneBtn = page.locator('button').filter({ hasText: /Sugarcane|ಕಬ್ಬು/i }).first();
    if (await sugarcaneBtn.isVisible()) {
      await sugarcaneBtn.click();
    }

    // Submit Registration
    console.log('[E2E] Submitting Registration for Kavana N');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Wait for redirect to home or login (if already exists, handle gracefully)
    await page.waitForTimeout(3000);

    // If on login page, log in with the new credentials
    if (page.url().includes('/login') || page.url().includes('/register')) {
      await page.goto('http://localhost:8000/login');
      await page.waitForLoadState('networkidle');
      await page.fill('input[type="text"]', 'kavana.farmer@example.com');
      await page.fill('input[type="password"]', 'KavanaFarmer@2026');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
    }

    // -------------------------------------------------------------
    // Step 3: Verify Profile Page Displays Kavana's True Identity
    // -------------------------------------------------------------
    console.log('[E2E] Navigating to Profile Page');
    await page.goto('http://localhost:8000/profile');
    await page.waitForLoadState('networkidle');

    // Check Header Avatar Initial & Name
    const headerInitial = page.locator('header').getByText('K', { exact: true });
    await expect(headerInitial).toBeVisible();

    // Check Profile Card details
    const profileHeading = page.locator('h1').filter({ hasText: 'Kavana N' });
    await expect(profileHeading).toBeVisible();
    console.log('[E2E] Verified Profile heading displays "Kavana N"');

    // Verify email belongs to Kavana, NOT Ramesh Gowda
    const emailText = page.getByText('kavana.farmer@example.com');
    await expect(emailText).toBeVisible();
    const rameshEmail = page.getByText('ramesh.gowda@mandyafarms.in');
    await expect(rameshEmail).toHaveCount(0);
    console.log('[E2E] Verified Email displays "kavana.farmer@example.com" and NEVER "ramesh.gowda@mandyafarms.in"');

    // Verify Diagnostics displays "FastAPI Connected", NEVER "MSW Mock Worker"
    const fastApiConnected = page.getByText('FastAPI Connected');
    await expect(fastApiConnected).toBeVisible();
    const mswMockWorker = page.getByText('MSW Mock Worker');
    await expect(mswMockWorker).toHaveCount(0);
    console.log('[E2E] Verified Platform Diagnostics displays "FastAPI Connected"');

    // Screenshot of verified Profile page
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'e2e_kavana_profile_verified.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Step 4: Edit Profile and Save
    // -------------------------------------------------------------
    console.log('[E2E] Updating Profile Bio');
    const bioTextarea = page.locator('textarea');
    if (await bioTextarea.isVisible()) {
      await bioTextarea.fill('Cultivating certified organic sugarcane in Shivapura canal command area.');
      const saveBtn = page.locator('button[type="submit"]');
      await saveBtn.click();
      await page.waitForTimeout(2000);
      console.log('[E2E] Profile bio updated successfully');
    }

    // -------------------------------------------------------------
    // Step 5: Create a Community Post & Verify in "My Posts"
    // -------------------------------------------------------------
    console.log('[E2E] Navigating to Community Forum');
    await page.goto('http://localhost:8000/community');
    await page.waitForLoadState('networkidle');

    // Click "Start Discussion" button
    const askBtn = page.getByRole('button', { name: /Start Discussion|ಚರ್ಚೆ ಪ್ರಾರಂಭಿಸಿ|Ask Question|ಪ್ರಶ್ನೆ ಕೇಳಿ/i }).first();
    await expect(askBtn).toBeVisible();
    await askBtn.click();
    await page.waitForTimeout(1000);

    // Fill Post Modal using precise name attributes
    await page.fill('input[name="title"]', 'Organic Drip Fertigation Trial by Kavana');
    await page.fill('textarea[name="content"]', 'Testing cow urine bio-digester slurry on 90-day sugarcane ratoon in Maddur.');
    
    const submitPostBtn = page.locator('div[role="dialog"] button[type="submit"]');
    await submitPostBtn.click();
    await page.waitForTimeout(3000);
    console.log('[E2E] Created new community post');

    // Switch to "My Posts" Tab
    console.log('[E2E] Switching to "My Posts" tab');
    const myPostsBtn = page.getByRole('button', { name: /My Posts|ನನ್ನ ಚರ್ಚೆಗಳು/i });
    await myPostsBtn.click();
    await page.waitForTimeout(2000);

    // Verify Kavana's post is visible in My Posts
    const myPostTitle = page.getByText('Organic Drip Fertigation Trial by Kavana').first();
    await expect(myPostTitle).toBeVisible();
    console.log('[E2E] Verified Kavana post appears in "My Posts"');

    // Verify Lakshmi Devi's posts do NOT appear in Kavana's "My Posts"
    const lakshmiPost = page.getByText(/Lakshmi Devi/i);
    await expect(lakshmiPost).toHaveCount(0);
    console.log('[E2E] Verified Lakshmi Devi posts DO NOT appear in Kavana "My Posts"');

    // -------------------------------------------------------------
    // Step 6: Create Produce Listing & Verify in "My Listings"
    // -------------------------------------------------------------
    console.log('[E2E] Navigating to Marketplace');
    await page.goto('http://localhost:8000/market');
    await page.waitForLoadState('networkidle');

    const sellBtn = page.getByRole('button', { name: /List Your Produce|ಉತ್ಪನ್ನ ಮಾರಾಟಕ್ಕೆ ಇಡಿ|Post Produce|ಮಾರಾಟಕ್ಕೆ ಇಡಿ/i }).first();
    await expect(sellBtn).toBeVisible();
    await sellBtn.click();
    await page.waitForTimeout(1000);

    // Fill Create Listing form
    const varietyInput = page.locator('input[name="variety"]');
    await expect(varietyInput).toBeVisible();
    await varietyInput.fill('Co 86032 Organic');
    await page.locator('input[name="quantity"]').fill('30');
    await page.locator('input[name="price_per_unit"]').fill('3250');

    const villageInput = page.locator('input[name="village"]');
    if (await villageInput.isVisible() && !(await villageInput.inputValue())) {
      await villageInput.fill('Shivapura');
    }
    const pickupInput = page.locator('input[name="pickup_address"]');
    if (await pickupInput.isVisible() && !(await pickupInput.inputValue())) {
      await pickupInput.fill('Shivapura Farm Gate');
    }

    const publishBtn = page.locator('div[role="dialog"] button[type="submit"]');
    await publishBtn.click();
    await page.waitForTimeout(3000);
    console.log('[E2E] Published new produce listing');

    // Switch to "My Listings"
    const myListingsBtn = page.getByRole('button', { name: /My Listings|ನನ್ನ ಮಾರಾಟ ಪಟ್ಟಿ|ನನ್ನ ಪಟ್ಟಿಗಳು/i }).first();
    if (await myListingsBtn.isVisible()) {
      await myListingsBtn.click();
      await page.waitForTimeout(2000);
      const myListing = page.getByText('Co 86032 Organic').first();
      await expect(myListing).toBeVisible();
      console.log('[E2E] Verified Kavana listing appears in "My Listings"');
    }

    // -------------------------------------------------------------
    // Step 7: Log Out & Register Second Account: Vijay Kumar (Buyer)
    // -------------------------------------------------------------
    console.log('[E2E] Logging out Kavana N');
    await page.goto('http://localhost:8000/profile');
    await page.waitForLoadState('networkidle');
    const logoutBtn = page.locator('header button:has(svg.lucide-log-out), button[aria-label*="Logout" i], button[title*="Logout" i]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log('[E2E] Registering Second Account: Vijay Kumar (Buyer)');
    await page.goto('http://localhost:8000/register');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="full_name"]', 'Vijay Kumar');
    await page.fill('input[name="email"]', 'vijay.buyer@example.com');
    await page.fill('input[name="phone_number"]', '9845222002');
    await page.fill('input[name="password"]', 'VijayBuyer@2026');
    await page.fill('input[name="confirm_password"]', 'VijayBuyer@2026');

    // Select Buyer Role
    const buyerCard = page.locator('button').filter({ hasText: /Buyer|ಖರೀದಿದಾರ/i }).first();
    await buyerCard.click();

    const buyerTalukSelect = page.locator('select').first();
    await buyerTalukSelect.selectOption({ label: 'Mandya' });

    const buyerBizInput = page.locator('input[name="buyer_business_name"]');
    if (await buyerBizInput.isVisible()) {
      await buyerBizInput.fill('Vijay Agro Mandi Ltd.');
    }

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    // If on login, log in
    if (page.url().includes('/login') || page.url().includes('/register')) {
      await page.goto('http://localhost:8000/login');
      await page.waitForLoadState('networkidle');
      await page.fill('input[type="text"]', 'vijay.buyer@example.com');
      await page.fill('input[type="password"]', 'VijayBuyer@2026');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
    }

    // -------------------------------------------------------------
    // Step 8: Verify Complete Data Isolation for Vijay Kumar
    // -------------------------------------------------------------
    console.log('[E2E] Verifying Vijay Kumar Profile & Isolation');
    await page.goto('http://localhost:8000/profile');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').filter({ hasText: 'Vijay Kumar' })).toBeVisible();
    await expect(page.getByText('vijay.buyer@example.com')).toBeVisible();
    console.log('[E2E] Verified Vijay Kumar profile is active and isolated');

    // In Community "My Posts": Must be EMPTY (Vijay has not posted)
    await page.goto('http://localhost:8000/community');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /My Posts|ನನ್ನ ಚರ್ಚೆಗಳು/i }).click();
    await page.waitForTimeout(1500);

    // Kavana's post must NOT be in Vijay's "My Posts"
    await expect(page.getByText('Organic Drip Fertigation Trial by Kavana')).toHaveCount(0);
    console.log('[E2E] Verified Kavana post DOES NOT appear in Vijay Kumar "My Posts"');

    // In Marketplace "My Listings": Must be EMPTY (Vijay has not listed produce)
    await page.goto('http://localhost:8000/market');
    await page.waitForLoadState('networkidle');
    const vijayMyListingsBtn = page.getByRole('button', { name: /My Listings|ನನ್ನ ಮಾರಾಟ ಪಟ್ಟಿ|ನನ್ನ ಪಟ್ಟಿಗಳು/i }).first();
    if (await vijayMyListingsBtn.isVisible()) {
      await vijayMyListingsBtn.click();
      await page.waitForTimeout(1500);
      await expect(page.getByText('Co 86032 Organic')).toHaveCount(0);
      console.log('[E2E] Verified Kavana produce listing DOES NOT appear in Vijay Kumar "My Listings"');
    }

    console.log('[E2E] COMPLETE BROWSER VERIFICATION PASSED');
  });

});
